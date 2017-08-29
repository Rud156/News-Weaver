var express = require('express');
var router = express.Router();

var requestModule = require('request');
var url = require('url');
var crypto = require('crypto');
var FeedParser = require('feedparser');

var Model = require('./../models/model');
var utility = require('./../utilities/utilities');
router.use(utility.checkAuthentication);


router.get('/get_feed', function(req, res) {
    let errorOccurred = false;
    let regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    var feedURL = req.query.url;
    var feedParser = new FeedParser();
    if (feedURL.trim() === '' || !regex.test(feedURL)) {
        return res.json({
            success: false,
            message: 'Invalid URL provided'
        });
    }

    requestModule({
            url: feedURL,
            maxRedirects: 3
        })
        .on('error', function(error) {
            errorOccurred = true;
            console.log('Request Error');
            console.log(error);
            res.json({
                success: false,
                message: `Unable to fetch the requested URL. ${error.message}`
            });
        })
        .on('response', function(response) {
            if (errorOccurred)
                return;

            if (response.statusCode !== 200)
                this.emit('error', new Error('Bad status code'));
            else {
                this.pipe(feedParser);
            }
        });

    var feedResult = [];
    feedParser
        .on('error', function(error) {
            if (errorOccurred)
                return;
            console.log('Feed Parser Error');
            console.log(error);
            if (!errorOccurred)
                res.json({
                    success: false,
                    message: `Invalid feed stream. ${error.message}`
                });
            errorOccurred = true;

        })
        .on('readable', function() {
            var stream = this;
            var item;
            while ((item = stream.read()) !== null)
                feedResult.push(item);
        })
        .on('end', function() {
            if (errorOccurred)
                return;

            try {
                var storyLink = url.parse(feedResult[0].link);
                var siteURL = storyLink.protocol + '//' + storyLink.hostname;
                var siteTitle = feedResult[0].meta.title;
                var siteDescription = feedResult[0].meta.description;
                var favicon = 'https://www.google.com/s2/favicons?domain=' + siteURL;

                res.json({
                    success: true,
                    feedDetails: {
                        feedURL: feedURL,
                        siteURL: siteURL,
                        title: siteTitle,
                        description: siteDescription,
                        favicon: favicon
                    }
                });
            } catch (error) {
                console.log(error);
                res.json({
                    success: false,
                    message: 'Invalid feed body. Unable to parse'
                });
            }
        });
});

router.get('/feed_news', function(req, res) {
    var username = req.decoded._doc.username;
    var hash = req.query.hash;
    var index = req.query.index;

    if (!hash || typeof hash !== 'string' || !username || typeof username !== 'string' ||
        !index || typeof index !== 'string')
        return res.json({
            success: false,
            message: 'Invalid feed provided'
        });

    try {
        index = parseInt(index);
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: 'Index is not a number. Invalid value'
        });
    }

    username = username.toLowerCase();

    Model.User.findOne({
            username: username
        }).exec()
        .then(function(user) {
            if (!user) {
                res.json({
                    success: false,
                    message: 'Invalid token user requested'
                });
                return Promise.reject('Error');
            } else {
                var array = [];
                array.push(user.favourites);
                array[1] = Model.FeedSchema.findOne({
                    hash: hash,
                    users: {
                        $in: [username]
                    }
                }).exec();

                return Promise.all(array);
            }
        })
        .then(function(data) {
            if (!data[1]) {
                res.json({
                    success: false,
                    message: 'You don\'t seem to have the feed in your list. Try something else'
                });
                return Promise.reject('Error');
            } else {
                var array = [];
                array.push(data[0]);
                array[1] = Model.FeedNews.find({
                    feedHash: hash
                }).sort({
                    date: -1
                }).exec();

                return Promise.all(array);
            }
        })
        .then(function(data) {
            data[1] = data[1].slice(index * 15, index * 15 + 15);
            res.json({
                success: true,
                message: 'Feed successfully retrieved',
                news: data[1],
                favourites: data[0]
            });
        })
        .catch(function(err) {
            if (err !== 'Error' && err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.get('/feed_source', function(req, res) {
    var username = req.decoded._doc.username;
    var hash = req.query.hash;

    if (!hash || typeof hash !== 'string' || !username || typeof username !== 'string')
        return res.json({
            success: false,
            message: 'Invalid feed provided'
        });

    username = username.toLowerCase();

    Model.FeedSchema.findOne({
            hash: hash,
            user: {
                $in: [username]
            }
        }).exec()
        .then(function(feed) {
            if (!feed) {
                res.json({
                    success: false,
                    message: 'You don\'t seem to have the feed in your list. Try something else'
                });
            } else
                res.json({
                    success: true,
                    message: 'Feed details',
                    feed: feed
                });
        })
        .catch(function(err) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.post('/save_feed', function(req, res) {
    var username = req.decoded._doc.username;
    var title = req.body.title;
    var description = req.body.description;
    var favicon = req.body.favicon;
    var feedURL = req.body.feedURL;
    var siteURL = req.body.siteURL;

    if (!username || !title || description === undefined || description === null ||
        !favicon || !feedURL || !siteURL ||
        typeof username !== 'string' || typeof title !== 'string' ||
        typeof description !== 'string' || typeof favicon !== 'string' ||
        typeof feedURL !== 'string' || typeof siteURL !== 'string')
        return res.json({
            success: false,
            message: 'Invalid fields entered'
        });

    username = username.toLowerCase();
    var siteHash = crypto.createHash('sha256').
    update(feedURL + title + description + favicon).digest('hex');

    Model.User.findOne({
            username: username,
            feeds: {
                $in: [siteHash]
            }
        }).exec()
        .then(function(user) {
            if (user) {
                res.json({
                    success: false,
                    message: 'Feed already exists in your source'
                });
                return Promise.reject('Error');
            } else
                return Model.User.findOneAndUpdate({
                    username: username
                }, {
                    $addToSet: {
                        feeds: siteHash
                    }
                }).exec();
        })
        .then(function(user) {
            if (user)
                return Model.FeedSchema.findOne({
                    hash: siteHash
                }).exec();
            else {
                res.json({
                    success: false,
                    message: 'Invalid token user requested'
                });
                return Promise.reject('Error');
            }
        })
        .then(function(feed) {
            if (!feed) {
                return Model.FeedSchema({
                    hash: siteHash,
                    title: title,
                    description: description,
                    favicon: favicon,
                    URL: siteURL,
                    feedURL: feedURL,
                    users: [username]
                }).save();
            } else {
                return Model.FeedSchema.findOneAndUpdate({
                    hash: siteHash
                }, {
                    $addToSet: {
                        users: username
                    }
                }).exec();
            }
        })
        .then(function(feed) {
            console.log(feed);
            res.json({
                success: true,
                message: 'Feed source added successfully',
                feed: feed
            });
        })
        .catch(function(err) {
            if (err !== 'Error' && err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
            }
        });
});

router.delete('/delete_feed', function(req, res) {
    var hash = req.query.hash;
    var username = req.decoded._doc.username;

    if (!username || !hash || typeof username !== 'string' || typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid fields entered'
        });

    username = username.toLowerCase();

    Model.User.findOneAndUpdate({
            username: username
        }, {
            $pull: {
                feeds: hash
            }
        }).exec()
        .then(function(user) {
            if (user)
                return Model.FeedSchema.findOne({
                    hash
                }).exec();
            else {
                res.json({
                    success: false,
                    message: 'Invalid token user requested'
                });
                return Promise.reject('Error');
            }
        })
        .then(function(feed) {
            if (!feed) {
                res.json({
                    success: false,
                    message: 'Feed does not exist'
                });
                return Promise.reject('Error');
            } else {
                var users = feed.users.length;
                if (users === 1) {
                    return Model.FeedSchema.findOneAndRemove({
                        hash: hash
                    }).exec();
                } else {
                    return Model.FeedSchema.findOneAndUpdate({
                        hash: hash
                    }, {
                        $pull: {
                            users: username
                        }
                    }).exec();
                }
            }
        })
        .then(function() {
            return Model.FeedSchema.findOne({
                hash: hash
            }).exec();
        })
        .then(function(feed) {
            if (!feed)
                return Model.FeedNews.remove({
                    feedHash: hash
                }).exec();
            else {
                res.json({
                    success: true,
                    message: 'Feed source successfully removed'
                });
                return Promise.reject('Error');
            }
        })
        .then(function() {
            res.json({
                success: true,
                message: 'Feed successfully removed'
            });
        })
        .catch(function(err) {
            if (err !== 'Error' && err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
            }
        });

});


module.exports = router;