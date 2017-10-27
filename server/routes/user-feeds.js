const express = require('express');
const router = express.Router();

const Model = require('./../models/model');
const crypto = require('crypto');
const moment = require('moment');
const Entities = require('html-entities')
    .AllHtmlEntities;
const entities = new Entities();

const utility = require('./../utilities/utilities');
router.use(utility.checkAuthentication);


router.get('/all_feed_sources', async(req, res) => {
    let username = req.decoded._doc.username;
    if (!username || typeof username !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials format'
        });

    username = username.toLowerCase();
    try {
        let user = await Model.User.findOne({
                username: username
            })
            .exec();
        if (!user)
            return res.json({
                success: false,
                message: 'Invalid token user requested'
            });
        let feeds = user.feeds;
        feeds = await Model.FeedSchema.find({
                hash: {
                    $in: feeds
                }
            })
            .exec();

        let modifiedFeed = feeds.map(function (feed) {
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
            feeds: modifiedFeed,
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

router.get('/all_feed_news', async(req, res) => {
    let username = req.decoded._doc.username;
    let index = req.query.index;

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

        let feedNews = await Model.FeedNews.find({
                feedHash: {
                    $in: user.feeds
                }
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
            message: 'Found all matching feed news',
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

router.get('/favourites', async(req, res) => {
    let username = req.decoded._doc.username;
    let index = req.query.index;

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
    try {
        let favourites = await Model.Favourite.find({
                username: username
            })
            .sort({
                date: -1
            })
            .exec();

        favourites = favourites.slice(index * 15, index * 15 + 15);
        favourites = favourites.map(element => {
            return {
                hash: element.hash,
                username: element.username,
                newsHash: element.newsHash,
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
            message: 'Successfully found all favourites',
            favourites: favourites
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

router.post('/save_favourite', async(req, res) => {
    let username = req.decoded._doc.username;
    let title = req.body.title;
    let description = req.body.description;
    let image = req.body.image;
    let URL = req.body.URL;
    let summary = req.body.summary;
    let date = moment(req.body.date)
        .utc()
        .toDate();
    let newsHash = req.body.hash;
    let category = req.body.category;
    let hash;

    if (!username || typeof username !== 'string' || !title ||
        !description || !image || !URL || !summary ||
        typeof username !== 'string' || typeof title !== 'string' ||
        typeof description !== 'string' || typeof image !== 'string' ||
        typeof URL !== 'string' || typeof summary !== 'string')
        return res.json({
            success: false,
            message: 'Invalid fields entered'
        });

    username = username.toLowerCase();
    hash = crypto.createHash('sha256')
        .update(entities.encode(title) + username)
        .digest('hex');

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

        await Model.User.findOneAndUpdate({
                username: username
            }, {
                $addToSet: {
                    favourites: newsHash
                }
            })
            .exec();

        let favourite = await Model.Favourite.findOne({
                hash: hash
            })
            .exec();
        if (favourite) {
            return res.json({
                success: false,
                message: 'Looks like you already added this news to your favourites'
            });
        }

        await Model.Favourite({
                hash: hash,
                newsHash: newsHash,
                username: username,
                title: entities.encode(title),
                description: entities.encode(description),
                image: entities.encode(image),
                URL: URL,
                summary: entities.encode(summary),
                category: category,
                date: date
            })
            .save();

        res.json({
            success: true,
            message: 'Successfully added news to favourites',
            favourite: favourite
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

router.patch('/edit_favourite', async(req, res) => {
    let username = req.decoded._doc.username;

    let image = req.body.image;
    let title = req.body.title;
    let description = req.body.description;
    let hash = req.body.hash;

    if (!username || !image || !title || !description || !hash || typeof username !== 'string' ||
        typeof image !== 'string' || typeof title !== 'string' || typeof description !== 'string' ||
        typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid fields entered'
        });

    username = username.toLowerCase();

    try {
        let favourite = await Model.Favourite.findOne({
                hash: hash
            })
            .exec();

        if (!favourite) {
            return res.json({
                success: false,
                message: 'Invalid document requested'
            });
        }

        favourite.title = entities.encode(title);
        favourite.description = entities.encode(description);
        favourite.image = entities.encode(image);
        await favourite.save();

        res.json({
            success: true,
            message: 'Favourite successfully updated',
            news: favourite
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

router.delete('/delete_favourite', async(req, res) => {
    let hash = req.query.hash;
    let newsHash = req.query.newsHash;
    let username = req.decoded._doc.username;

    if (!hash || !username || typeof hash !== 'string' || typeof username !== 'string' ||
        !newsHash || typeof newsHash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    username = username.toLowerCase();

    try {
        let user = await Model.User.findOneAndUpdate({
                username: username
            }, {
                $pull: {
                    favourites: newsHash
                }
            })
            .exec();

        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid token user requested'
            });
        }

        let favourite = await Model.Favourite.findOneAndRemove({
                hash: hash
            })
            .exec();

        if (!favourite)
            return res.json({
                success: false,
                message: 'Favourite does not exists'
            });
        res.json({
            success: true,
            message: 'Favourite successfully deleted',
            favourite: favourite
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

module.exports = router;
