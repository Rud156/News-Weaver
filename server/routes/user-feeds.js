var express = require('express');
var router = express.Router();

var Model = require('./../models/model');
var crypto = require('crypto');

var utility = require('./../utilities/utilities');
router.use(utility.checkAuthentication);

router.get('/all_feed_sources', function (req, res) {
    var username = req.decoded._doc.username;
    if (!username || typeof username !== 'string')
        return res.json({ success: false, message: 'Invalid credentials format' });

    username = username.toLowerCase();

    Model.User.findOne({ username: username }).exec()
        .then(function (user) {
            if (user)
                return user.feeds;
            else {
                res.json({ success: false, message: 'Invalid token user requested' });
                return Promise.reject('Error');
            }
        })
        .then(function (feeds) {
            return Model.FeedSchema.find({
                hash: {
                    $in: feeds
                }
            }).exec();
        })
        .then(function (feeds) {
            var modifiedFeed = feeds.map(function (feed) {
                return {
                    hash: feed.hash,
                    title: feed.title,
                    description: feed.description,
                    category: feed.category,
                    feedURL: feed.feedURL,
                    siteURL: feed.URl,
                    favicon: feed.favicon
                };
            });
            res.json({
                success: true,
                message: 'Found user\'s all feeds',
                feeds: modifiedFeed
            });
        })
        .catch(function (err) {
            if (err !== 'Error' && err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.get('/all_feed_news', function (req, res) {
    var username = req.decoded._doc.username;
    if (!username || typeof username !== 'string')
        return res.json({ success: false, message: 'Invalid credentials format' });

    username = username.toLowerCase();

    Model.User.findOne({ username: username }).exec()
        .then(function (user) {
            if (!user) {
                res.json({ success: false, message: 'Invalid token user requested' });
                return Promise.reject('Error');
            }
            else {
                return Model.FeedNews.find({
                    feedHash: {
                        $in: user.feeds
                    }
                }).sort({ date: -1 }).exec();
            }
        })
        .then(function (news) {
            res.json({ success: true, message: 'Found all matching feed news', news: news });
        })
        .catch(function (err) {
            if (err !== 'Error' && err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.post('/save_favourite', function (req, res) {
    var feedNews = req.body.feedNews;
    var username = req.decoded._doc.username;
    var hash;

    if (!username || typeof username !== 'string' || !feedNews || typeof feedNews !== 'object')
        return res.json({ success: false, message: 'Invalid fields entered' });

    username = username.toLowerCase();

    try {
        hash = crypto.createHash('sha256').
            update(feedNews.title + feedNews.news + feedNews.siteURL + username).digest('hex');
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Invalid news format' });
    }

    Model.User.findOne({ username: username }).exec()
        .then(function (user) {
            if (!user) {
                res.json({ success: false, message: 'Invalid token user requested' });
                return Promise.reject('Error');
            }
            else
                return username;
        })
        .then(function (username) {
            return Model.Favourite({
                hash: hash,
                username: username,
                news: feedNews
            });
        })
        .then(function (news) {
            return news.save();
        })
        .then(function (news) {
            res.json({
                success: true,
                message: 'Successfully added news to favourites',
                news: news
            });
        })
        .catch(function (err) {
            if (err !== 'Error' && err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.patch('/edit_favourite', function (req, res) {
    var username = req.decoded._doc.username;

    var image = req.body.imageURL;
    var title = req.body.title;
    var summary = req.body.summary;
    var hash = req.body.hash;

    if (!username || !image || !title || !summary || !hash || typeof username !== 'string' ||
        typeof image !== 'string' || typeof title !== 'string' || typeof summary !== 'string' ||
        typeof hash !== 'string')
        return res.json({ success: false, message: 'Invalid fields entered' });

    username = username.toLowerCase();

    Model.User.findOne({ username: username }).exec()
        .then(function (user) {
            if (!user) {
                res.json({ success: false, message: 'Invalid token user requested' });
                return Promise.reject('Error');
            }
            else
                return Model.Favourite.findOne({ hash: hash }).exec();
        })
        .then(function (favourite) {
            if (!favourite) {
                res.json({ success: false, message: 'Invalid document requested' });
                return Promise.reject('Error');
            }
            else {
                favourite.news.title = title;
                favourite.news.summary = summary;
                favourite.news.image = image;
                return favourite.save();
            }
        })
        .then(function (favourite) {
            res.json({
                success: true,
                message: 'Favourite successfully updated',
                news: favourite
            });
        })
        .catch(function (err) {
            if (err !== 'Error' && err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.delete('/delete_favourite', function (req, res) {
    var hash = req.query.hash;
    var username = req.decoded._doc.username;

    if (!hash || !username || typeof hash !== 'string' || typeof username !== 'string')
        return res.json({ success: false, message: 'Invalid credentials submitted' });

    username = username.toLowerCase();

    Model.User.findOne({ username: username }).exec()
        .then(function (user) {
            if (!user) {
                res.json({ success: false, message: 'Invalid token user requested' });
                return Promise.reject('Error');
            }
            else
                return Model.Favourite.findOneAndRemove({ hash: hash }).exec();
        })
        .then(function (favourite) {
            if (!favourite)
                res.json({ success: false, message: 'Favourite does not exists' });
            else
                res.json({
                    success: true,
                    message: 'Favourite successfully deleted',
                    favourite: favourite
                });
        })
        .catch(function (err) {
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