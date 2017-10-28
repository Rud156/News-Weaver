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

router.get('/reading_list', async(req, res) => {
    let username = req.decoded._doc.username;

    if (!username || typeof username !== 'string')
        return res.json({
            success: false,
            message: 'Invalid token requested'
        });

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

        let readingList = await Model.ReadingList.find({
                username: username
            })
            .sort({
                date: -1
            })
            .exec();
        readingList = readingList.map(element => {
            return {
                hash: element.hash,
                username: element.username,
                newsHash: element.newsHash,
                title: entities.decode(element.title),
                description: entities.decode(element.description),
                image: entities.decode(element.image),
                summary: entities.decode(element.summary),
                URL: element.URL,
                date: element.date,
                read: element.read
            };
        });

        res.json({
            success: true,
            message: 'All Deferred Reading News',
            readingList: readingList,
            user: utility.stripUser(user)
        });
    } catch (error) {
        if (error !== 'Error' && error) {
            console.log(error);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
        }
    }
});

router.post('/reading_list', async(req, res) => {
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
    let hash;

    if (!username || !title || !description || !image || !URL || !summary ||
        typeof username !== 'string' || typeof title !== 'string' ||
        typeof description !== 'string' || typeof image !== 'string' ||
        typeof URL !== 'string' || typeof summary !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    username = username.toLowerCase();

    hash = crypto.createHash('sha256')
        .update(entities.encode(title) + username)
        .digest('hex');

    try {
        let news = await Model.ReadingList.findOne({
                hash: hash
            })
            .exec();

        if (news) {
            return res.json({
                success: false,
                message: 'Looks like you already added this news to your reading list.'
            });
        }

        await Model.ReadingList({
                hash: hash,
                newsHash: newsHash,
                title: entities.encode(title),
                description: entities.encode(description),
                image: entities.encode(image),
                URL: URL,
                summary: entities.encode(summary),
                date: date,
                read: false,
                username: username
            })
            .save();

        res.json({
            success: true,
            message: 'News successfully added to reading list.',
            news: news
        });
    } catch (error) {
        if (error !== 'Error' && error) {
            console.log(error);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
        }
    }
});

router.patch('/reading_list', async(req, res) => {
    let hash = req.query.hash;

    if (!hash || typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    try {
        let news = await Model.ReadingList.findOne({
                hash: hash
            })
            .exec();

        if (!news) {
            return res.json({
                success: false,
                message: 'Invalid news requested'
            });
        }

        news.read = true;
        await news.save();
        res.json({
            success: true,
            message: 'Marked as read',
            news: news
        });

    } catch (error) {
        if (error !== 'Error' && error) {
            console.log(error);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
        }
    }
});

router.delete('/reading_list', async(req, res) => {
    let hash = req.query.hash;

    if (!hash || typeof hash !== 'string')
        return res.json({
            success: false,
            message: 'Invalid credentials submitted'
        });

    try {
        let news = await Model.ReadingList.findOneAndRemove({
                hash: hash
            })
            .exec();

        if (!news)
            return res.json({
                success: false,
                message: 'News does not exist in your reading list.'
            });

        res.json({
            success: true,
            message: 'News removed from reading list',
            news: news
        });
    } catch (error) {
        if (error !== 'Error' && error) {
            console.log(error);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime'
                });
        }
    }
});

module.exports = router;
