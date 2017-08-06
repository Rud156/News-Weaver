var express = require('express');
var router = express.Router();

var Model = require('./../models/model');
var crypto = require('crypto');

var utility = require('./../utilities/utilities');
router.use(utility.checkAuthentication);

router.get('/reading_list', function(req, res) {
    var username = req.decoded._doc.username;

    if (!username || typeof username !== 'string')
        return res.json({
            success: false,
            message: 'Invalid token requested'
        });
    username = username.toLowerCase();

    Model.ReadingList.find({
            username: username
        }).exec()
        .then(function(news) {
            res.json({
                success: true,
                message: 'All Deferred Reading News',
                news: news
            });
        })
        .catch(function(error) {
            if (error !== 'Error' && error) {
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.post('/reading_list', function(req, res) {
    var username = req.decoded._doc.username;
    var title = req.body.title;
    var description = req.body.description;
    var image = req.body.image;
    var URL = req.body.URL;
    var summary = req.body.summary;
    var date = new Date();
    var hash;

    if (!username || !title || !description || !image || !URL || !summary ||
        typeof username !== 'string' || typeof title !== 'string' ||
        typeof description !== 'string' || typeof image !== 'string' ||
        typeof URL !== 'string' || typeof summary !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    username = username.toLowerCase();
    hash = crypto.createHash('sha256').update(title + username).digest('hex');
    Model.ReadingList.findOne({
            hash: hash
        }).exec()
        .then(function(news) {
            if (news) {
                res.json({
                    success: false,
                    message: 'News already exists in your list'
                });
                Promise.reject('Error');
            } else {
                return Model.ReadingList({
                    hash: hash,
                    username: username,
                    title: title,
                    description: description,
                    image: image,
                    URL: URL,
                    summary: summary,
                    date: date,
                    read: false
                }).save();
            }
        })
        .then(function(news) {
            res.json({
                success: true,
                message: 'News successfully added to reading list',
                news: news
            });
        })
        .catch(function(error) {
            if (error !== 'Error' && error) {
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.patch('/reading_list', function(req, res) {
    var hash = req.query.hash;

    if (!hash || typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    Model.ReadingList.findOne({
            hash: hash
        }).exec()
        .then(function(news) {
            if (!news) {
                res.json({
                    success: false,
                    message: 'Invalid news requested'
                });
                return Promise.reject('Error');
            } else {
                news.read = true;
                return news.save();
            }
        })
        .then(function(news) {
            res.json({
                success: true,
                message: 'Marked as read',
                news: news
            });
        })
        .catch(function(error) {
            if (error !== 'Error' && error) {
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

router.delete('/reading_list', function(req, res) {
    var hash = req.query.hash;

    if (!hash || typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    Model.ReadingList.findOneAndRemove({
            hash: hash
        }).exec()
        .then(function() {
            res.json({
                success: true,
                message: 'News removed from reading list'
            });
        })
        .catch(function(error) {
            if (error !== 'Error' && error) {
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
            }
        });
});

module.exports = router;