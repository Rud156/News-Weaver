const express = require('express');
const router = express.Router();

const requestModule = require('request');
const url = require('url');
const crypto = require('crypto');
const FeedParser = require('feedparser');
const Entities = require('html-entities')
    .AllHtmlEntities;
const entities = new Entities();

const Model = require('./../models/model');
const utility = require('./../utilities/utilities');
router.use(utility.checkAuthentication);


router.get('/get_feed', (req, res) => {
    let errorOccurred = false;
    let regex = utility.urlRegex;
    let feedURL = req.query.url;
    let feedParser = new FeedParser();
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
        .on('error', function (error) {
            errorOccurred = true;
            console.log('Request Error');
            console.log(error);
            res.json({
                success: false,
                message: `Unable to fetch the requested URL. ${error.message}`
            });
        })
        .on('response', function (response) {
            if (errorOccurred)
                return;

            console.log(response.statusCode);

            if (response.statusCode !== 200)
                this.emit('error', new Error('Bad status code'));
            else {
                this.pipe(feedParser);
            }
        });

    let feedResult = [];
    feedParser
        .on('error', function (error) {
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
        .on('readable', function () {
            let stream = this;
            let item;
            while ((item = stream.read()) !== null)
                feedResult.push(item);
        })
        .on('end', function () {
            if (errorOccurred)
                return;

            try {
                let storyLink = url.parse(feedResult[0].link);
                let siteURL = storyLink.protocol + '//' + storyLink.hostname;
                let siteTitle = feedResult[0].meta.title;
                let siteDescription = feedResult[0].meta.description || siteTitle;
                let favicon = 'https://www.google.com/s2/favicons?domain=' + siteURL;

                res.json({
                    success: true,
                    feed: {
                        feedURL: feedURL,
                        siteURL: siteURL,
                        title: siteTitle,
                        description: siteDescription,
                        favicon: favicon
                    },
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

router.get('/feed_news', async(req, res) => {
    let username = req.decoded._doc.username;
    let hash = req.query.hash;
    let index = req.query.index;

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
    try {
        let user = await Model.User.findOne({
                username: username
            })
            .exec();

        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid token user requested'
            });
        }
        let feedSource = await Model.FeedSchema.findOne({
                hash: hash,
                users: {
                    $in: [username]
                }
            })
            .exec();

        if (!feedSource) {
            return res.json({
                success: false,
                message: 'You don\'t seem to have the feed in your list. Try something else.'
            });

        }

        let feedNews = await Model.FeedNews.find({
                feedHash: hash
            })
            .sort({
                date: -1
            })
            .exec();

        feedNews = feedNews.slice(index * 15, index * 15 + 15);
        feedNews = feedNews.map(element => {
            return {
                hash: element.hash,
                feedHash: element.feedHash,
                title: entities.decode(element.title),
                description: entities.decode(element.description),
                image: entities.decode(element.image),
                summary: entities.decode(element.summary),
                URL: element.URL,
                category: element.category,
                date: element.date
            };
        });
        res.json({
            success: true,
            message: 'Feed successfully retrieved',
            news: feedNews,
            user: utility.stripUser(user)
        });
    } catch (err) {
        if (err !== 'Error' && err) {
            console.log(err);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
        }
    }
});

router.get('/feed_source', async(req, res) => {
    let username = req.decoded._doc.username;
    let hash = req.query.hash;

    if (!hash || typeof hash !== 'string' || !username || typeof username !== 'string')
        return res.json({
            success: false,
            message: 'Invalid feed provided'
        });

    username = username.toLowerCase();
    try {
        let feed = await Model.FeedSchema.findOne({
                hash: hash,
                user: {
                    $in: [username]
                }
            })
            .exec();

        if (!feed) {
            return res.json({
                success: false,
                message: 'You don\'t seem to have the feed in your list. Try something else'
            });
        }

        res.json({
            success: true,
            message: 'Feed details',
            feed: utility.stripFeed(feed)
        });
    } catch (err) {
        if (err) {
            console.log(err);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
        }
    }
});

router.post('/save_feed', async(req, res) => {
    let username = req.decoded._doc.username;
    let title = req.body.title;
    let description = req.body.description;
    let favicon = req.body.favicon;
    let feedURL = req.body.feedURL;
    let siteURL = req.body.siteURL;

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
    let siteHash = crypto.createHash('sha256')
        .
    update(feedURL + title + description + favicon)
        .digest('hex');

    try {
        let user = await Model.User.findOne({
                username: username,
                feeds: {
                    $in: [siteHash]
                }
            })
            .exec();

        if (user) {
            return res.json({
                success: false,
                message: 'Feed already exists in your source'
            });
        }

        user = await Model.User.findOneAndUpdate({
                username: username
            }, {
                $addToSet: {
                    feeds: siteHash
                }
            })
            .exec();

        if (!user)
            return res.json({
                success: false,
                message: 'Invalid token user requested'
            });
        let feed = await Model.FeedSchema.findOne({
                hash: siteHash
            })
            .exec();

        if (!feed) {
            feed = await Model.FeedSchema({
                    hash: siteHash,
                    title: title,
                    description: description,
                    favicon: favicon,
                    URL: siteURL,
                    feedURL: feedURL,
                    users: [username]
                })
                .save();
        }
        feed = await Model.FeedSchema.findOneAndUpdate({
                hash: siteHash
            }, {
                $addToSet: {
                    users: username
                }
            })
            .exec();

        console.log(feed);
        res.json({
            success: true,
            message: 'Feed source added successfully',
            feed: utility.stripFeed(feed),
            user: utility.stripUser(user)
        });

    } catch (err) {
        if (err !== 'Error' && err) {
            console.log(err);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
        }
    }
});

router.delete('/delete_feed', async(req, res) => {
    let hash = req.query.hash;
    let username = req.decoded._doc.username;

    if (!username || !hash || typeof username !== 'string' || typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid fields entered'
        });

    username = username.toLowerCase();
    try {
        let user = await Model.User.findOneAndUpdate({
                username: username
            }, {
                $pull: {
                    feeds: hash
                }
            })
            .exec();

        if (!user)
            return res.json({
                success: false,
                message: 'Invalid token user requested'
            });
        let feed = await Model.FeedSchema.findOne({
                hash
            })
            .exec();

        if (!feed) {
            return res.json({
                success: false,
                message: 'Feed does not exist'
            });
        }
        let users = feed.users.length;

        if (users === 1) {
            await Model.FeedSchema.findOneAndRemove({
                    hash: hash
                })
                .exec();
        } else {
            await Model.FeedSchema.findOneAndUpdate({
                    hash: hash
                }, {
                    $pull: {
                        users: username
                    }
                })
                .exec();
        }

        feed = await Model.FeedSchema.findOne({
                hash: hash
            })
            .exec();

        if (!feed)
            await Model.FeedNews.remove({
                feedHash: hash
            })
            .exec();
        else {
            return res.json({
                success: true,
                message: 'Feed source successfully removed',
                user: utility.stripUser(user)
            });
        }

        res.json({
            success: true,
            message: 'Feed successfully removed',
            user: utility.stripUser(user)
        });

    } catch (err) {
        if (err !== 'Error' && err) {
            console.log(err);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
        }
    }
});

module.exports = router;
