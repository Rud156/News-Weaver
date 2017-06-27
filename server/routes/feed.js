var express = require('express');
var router = express.Router();

var requestModule = require('request'); 
var url = require('url');
var crypto = require('crypto');
var FeedParser = require('feedparser');

var Model = require('./../models/model');
var utility = require('./../utilities/utilities');
router.use(utility.checkAuthentication);


router.get('/get_feed', function (req, res) {
    var feedUrl = req.query.url;
    var feedParser = new FeedParser();
    if (feedUrl.trim() === '') {
        return res.json({ success: false, message: 'Invalid URL provided' });
    }

    var request = requestModule(feedUrl);
    request.on('error', function (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch the request URL. Please try again.'
        });
    });
    request.on('response', function (response) {
        if (response.statusCode !== 200)
            this.emit('error', new Error('Bad status code'));
        else {
            this.pipe(feedParser);
        }
    });

    var feedResult = [];
    feedParser.on('error', function (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Invalid feed stream'
        });
    });
    feedParser.on('readable', function () {
        var stream = this;
        var item;
        while ((item = stream.read()) !== null)
            feedResult.push(item);
    });
    feedParser.on('end', function () {
        var storyLink = url.parse(feedResult[0].link);
        var siteURL = storyLink.protocol + '//' + storyLink.hostname;
        var siteTitle = feedResult[0].meta.title;
        var siteDescription = feedResult[0].meta.description;
        var favicon = 'http://www.google.com/s2/favicons?domain=' + siteURL;

        res.json({
            success: true,
            feedDetails: {
                URL: feedUrl,
                site: siteURL,
                title: siteTitle,
                description: siteDescription,
                favicon: favicon
            }
        });
    });
});

router.get('/feed_news', function (req, res) {
    var username = req.decoded._doc.username;
    var hash = req.query.hash;

    if (!hash || typeof hash !== 'string' || !username || typeof username !== 'string')
        return res.json({ success: false, message: 'Invalid feed provided' });

    username = username.toLowerCase();

    Model.FeedSchema.findOne({ hash: hash, user: { $in: [username] } }).exec()
        .then(function (feed) {
            if (feed.count() < 1) {
                res.json({
                    success: false,
                    message: 'You don\'t seem to have the feed in your list. Try something else'
                });
            }
            else
                res.json({ success: false, message: 'Feed found', news: feed.news });
        })
        .catch(function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.post('/save_feed', function (req, res) {
    var username = req.decoded._doc.username;
    var category = req.body.category;
    var title = req.body.title;
    var description = req.body.description;
    var favicon = req.body.favicon;
    var feedUrl = req.body.feedUrl;
    var siteUrl = req.body.siteUrl;

    if (!username || !category || !title || !description || !favicon || !feedUrl || !siteUrl ||
        typeof username !== 'string' || typeof category !== 'string' || typeof title !== 'string' ||
        typeof description !== 'string' || typeof favicon !== 'string' ||
        typeof feedUrl !== 'string' || typeof siteUrl !== 'string')
        return res.json({ success: false, message: 'Invalid fields entered' });

    username = username.toLowerCase();
    var siteHash = crypto.createHash('sha256').
        update(feedUrl + title + description + favicon).digest('hex');

    Model.User.findOneAndUpdate({ username: username },
        {
            $addToSet: {
                feeds: siteHash
            }
        }).exec()
        .then(function (user) {
            if (user)
                return Model.FeedSchema.findOne({ hash: siteHash }).exec();
            else
                res.json({ success: false, message: 'Invalid username provided' });
        })
        .then(function (feed) {
            if (!feed) {
                return Model.FeedSchema({
                    hash: siteHash,
                    title: title,
                    description: description,
                    favicon: favicon,
                    URL: siteUrl,
                    feedURL: feedUrl,
                    category: category,
                    users: [username]
                }).save();
            }
            else {
                return Model.FeedSchema.findOneAndUpdate({ hash: siteHash }, {
                    $addToSet: {
                        users: username
                    }
                }).exec();
            }
        })
        .then(function (feed) {
            res.json({ success: true, message: 'Feed updated successfully', feed: feed });
        })
        .catch(function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
            }
        });
});

router.delete('/delete_feed', function (req, res) {
    var hash = req.body.hash;
    var username = req.decoded._doc.username;

    if (!username || !hash || typeof username !== 'string' || typeof hash !== 'string')
        return res.json({ success: false, message: 'Invalid fields entered' });

    username = username.toLowerCase();

    Model.User.findOneAndUpdate({ username: username },
        {
            $pull: {
                feeds: hash
            }
        }).exec()
        .then(function (user) {
            if (user)
                return Model.FeedSchema.findOne({ hash }).exec();
            else
                res.json({
                    success: false,
                    message: 'Invalid username provided'
                });
        })
        .then(function (feed) {
            if (!feed) {
                res.json({ success: false, message: 'Feed does not exist' });
            }
            else {
                var users = feed.users.length;
                if (users === 1) {
                    return Model.FeedSchema.findOneAndRemove({ hash: hash }).exec();
                }
                else {
                    return Model.FeedSchema.findOneAndUpdate({ hash: hash },
                        {
                            $pull: {
                                users: username
                            }
                        }
                    ).exec();
                }
            }
        })
        .then(function (feed) {
            res.json({ success: true, message: 'Feed deleted successfully', feed: feed });
        })
        .catch(function (err) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
            }
        });

});


module.exports = router;