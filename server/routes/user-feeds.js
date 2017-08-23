var express = require('express');
var router = express.Router();

var Model = require('./../models/model');
var crypto = require('crypto');
var moment = require('moment');

var utility = require('./../utilities/utilities');
router.use(utility.checkAuthentication);

router.get('/all_feed_sources', function(req, res) {
    var username = req.decoded._doc.username;
    if (!username || typeof username !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials format'
        });

    username = username.toLowerCase();

    Model.User.findOne({
            username: username
        }).exec()
        .then(function(user) {
            if (user)
                return user.feeds;
            else {
                res.json({
                    success: false,
                    message: 'Invalid token user requested'
                });
                return Promise.reject('Error');
            }
        })
        .then(function(feeds) {
            return Model.FeedSchema.find({
                hash: {
                    $in: feeds
                }
            }).exec();
        })
        .then(function(feeds) {
            var modifiedFeed = feeds.map(function(feed) {
                return {
                    hash: feed.hash,
                    title: feed.title,
                    description: feed.description,
                    feedURL: feed.feedURL,
                    URL: feed.URL,
                    favicon: feed.favicon
                };
            });
            console.log(modifiedFeed);
            res.json({
                success: true,
                message: 'Found user\'s all feeds',
                feeds: modifiedFeed
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

router.get('/all_feed_news', function(req, res) {
    var username = req.decoded._doc.username;
    var index = req.query.index;

    if (!username || typeof username !== 'string' || !index || typeof index !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials format'
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
    var favourites;

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
                favourites = user.favourites;
                return Model.FeedNews.find({
                    feedHash: {
                        $in: user.feeds
                    }
                }).sort({
                    date: -1
                }).exec();
            }
        })
        .then(function(news) {
            news = news.slice(index * 15, index * 15 + 15);
            res.json({
                success: true,
                message: 'Found all matching feed news',
                news: news,
                favourites: favourites
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

router.get('/favourites', function(req, res) {
    var username = req.decoded._doc.username;
    var index = req.query.index;

    if (!username || typeof username !== 'string' || !index || typeof index !== 'string')
        return res.json({
            success: false,
            message: 'Invalid token user requested'
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
    Model.Favourite.find({
            username: username
        }).sort({
            date: -1
        }).exec()
        .then(function(favourites) {
            favourites = favourites.slice(index * 15, index * 15 + 15);
            res.json({
                success: true,
                message: 'Successfully found all favourites',
                favourites: favourites
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

router.post('/save_favourite', function(req, res) {
    var feedNews = req.body.feedNews;
    var username = req.decoded._doc.username;
    var newsHash;
    var hash;

    if (!username || typeof username !== 'string' || !feedNews || typeof feedNews !== 'object')
        return res.json({
            success: false,
            message: 'Invalid fields entered'
        });

    username = username.toLowerCase();

    try {
        hash = crypto.createHash('sha256').update(feedNews.title + username).digest('hex');
        newsHash = feedNews.hash;
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: 'Invalid news format'
        });
    }

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
                return Model.User.findOneAndUpdate({
                    username: username
                }, {
                    $addToSet: {
                        favourites: newsHash
                    }
                }).exec();
            }
        })
        .then(function() {
            return Model.Favourite.findOne({
                hash: hash
            }).exec();
        })
        .then(function(favourite) {
            if (favourite) {
                res.json({
                    success: false,
                    message: 'News already added to favourites'
                });
                return Promise.reject('Error');
            } else
                return username;
        })
        .then(function(username) {
            try {
                return Model.Favourite({
                    hash: hash,
                    newsHash: newsHash,
                    username: username,
                    title: feedNews.title,
                    description: feedNews.description,
                    image: feedNews.image,
                    URL: feedNews.URL,
                    summary: feedNews.summary,
                    category: feedNews.category,
                    date: moment(feedNews.date).utc().toDate()
                }).save();
            } catch (error) {
                console.log(error);
                return Promise.reject('Error');
            }
        })
        .then(function(favourite) {
            res.json({
                success: true,
                message: 'Successfully added news to favourites',
                favourite: favourite
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

router.patch('/edit_favourite', function(req, res) {
    var username = req.decoded._doc.username;

    var image = req.body.image;
    var title = req.body.title;
    var description = req.body.description;
    var hash = req.body.hash;

    if (!username || !image || !title || !description || !hash || typeof username !== 'string' ||
        typeof image !== 'string' || typeof title !== 'string' || typeof description !== 'string' ||
        typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid fields entered'
        });

    username = username.toLowerCase();

    Model.Favourite.findOne({
            hash: hash
        }).exec()
        .then(function(favourite) {
            if (!favourite) {
                res.json({
                    success: false,
                    message: 'Invalid document requested'
                });
                return Promise.reject('Error');
            } else {
                favourite.title = title;
                favourite.description = description;
                favourite.image = image;
                return favourite.save();
            }
        })
        .then(function(favourite) {
            res.json({
                success: true,
                message: 'Favourite successfully updated',
                news: favourite
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

router.delete('/delete_favourite', function(req, res) {
    var hash = req.query.hash;
    var newsHash = req.query.newsHash;
    var username = req.decoded._doc.username;

    if (!hash || !username || typeof hash !== 'string' || typeof username !== 'string' ||
        !newsHash || typeof newsHash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    username = username.toLowerCase();

    Model.User.findOneAndUpdate({
            username: username
        }, {
            $pull: {
                favourites: newsHash
            }
        }).exec()
        .then(function(user) {
            if (!user) {
                res.json({
                    success: false,
                    message: 'Invalid token user requested'
                });
                return Promise.reject('Error');
            } else
                return Model.Favourite.findOneAndRemove({
                    hash: hash
                }).exec();
        })
        .then(function(favourite) {
            if (!favourite)
                res.json({
                    success: false,
                    message: 'Favourite does not exists'
                });
            else
                res.json({
                    success: true,
                    message: 'Favourite successfully deleted',
                    favourite: favourite
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

module.exports = router;