const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('./../models/config');
const Model = require('./../models/model');
const utility = require('./../utilities/utilities');

router.post('/login', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let usernameRegex = utility.usernameRegex;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string' ||
        !usernameRegex.test(username))
        return res.json({
            success: false,
            message: 'Incorrect credentials format'
        });
    else {
        username = username.toLowerCase();
        try {
            let user = await Model.User.findOne({
                    username: username
                })
                .exec();
            if (!user) {
                return res.json({
                    success: false,
                    message: 'Sorry but it looks like such a user does not exist.'
                });
            } else {
                let isMatch = await Model.validatePassword(password, user.password);
                if (!isMatch)
                    return res.json({
                        success: false,
                        message: 'Woah. Your password does not match the one you provided.'
                    });

                let token = jwt.sign({
                        _doc: {
                            username: user.username
                        }
                    },
                    config.secret, {
                        expiresIn: '7d'
                    });
                let secureToken = utility.encrypt(token, config.secret);
                return res.json({
                    success: true,
                    token: secureToken,
                    user: utility.stripUser(user)
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
        }
    }
});

router.post('/register', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let rePassword = req.body.rePassword;
    let usernameRegex = utility.usernameRegex;

    if (!username || !password || typeof (username) !== 'string' ||
        typeof (password) !== 'string' || !rePassword || typeof rePassword !== 'string' ||
        !usernameRegex.test(username))
        return res.json({
            success: false,
            message: 'Sorry looks like you entered something incorrect. Give it one more shot.'
        });
    if (password !== rePassword)
        return res.json({
            success: false,
            message: 'Passwords do not match'
        });
    else {
        username = username.toLowerCase();

        try {
            let user = await Model.User.findOne({
                    username: username
                })
                .exec();
            if (user) {
                return res.json({
                    success: false,
                    message: 'Awesome name but unfortunately its already taken. Please select another one.'
                });
            }

            let hash = await Model.createHash(password);
            let averageJoe = await Model.User({
                username: username,
                password: hash
            });
            user = await averageJoe.save();
            res.json({
                success: true,
                message: 'YAY! You signed up.',
                user: utility.stripUser(user)
            });

        } catch (error) {
            console.log(error);
            res.status(500)
                .json({
                    success: false,
                    message: 'Something happened at our end. Check back after sometime.'
                });
        }
    }
});

module.exports = router;
