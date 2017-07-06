var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var config = require('./../models/config');
var Model = require('./../models/model');

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string')
        return res.json({ success: false, message: 'Incorrect credentials format' });
    else {
        username = username.toLowerCase();
        Model.User.findOne({ username: username }).exec()
            .then(function (user) {
                if (!user)
                    res.json({ success: false, message: 'User authentication failed' });
                else {
                    return Model.validatePassword(password, user.password)
                        .then(function (isMatch) {
                            if (!isMatch)
                                res.json({ success: false, message: 'User authentication failed' });
                            else {
                                var token = jwt.sign(user, config.secret, {
                                    expiresIn: '7d'
                                });
                                res.json({ success: true, token: token });
                            }
                        });
                }
            })
            .catch(function (err) {
                if (err !== 'Error' && err) {
                    console.log(err);
                    res.status(500).json({
                        success: false,
                        message: 'Something happened at our end. Check back after sometime.'
                    });
                }
            });
    }
});

router.post('/register', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var rePassword = req.body.rePassword;

    if (!username || !password || typeof (username) !== 'string' ||
        typeof (password) !== 'string' || !rePassword || typeof rePassword !== 'string')
        return res.json({ success: false, message: 'Incorrect credentials format' });
    if (password !== rePassword)
        return res.json({ success: false, message: 'Passwords do not match' });
    else {
        username = username.toLowerCase();
        Model.User.findOne({ username: username }).exec()
            .then(function (user) {
                if (user) {
                    res.json({
                        success: false,
                        message: 'User is already registered. Please select another username.'
                    });
                    return Promise.reject('Error');
                }
                else {
                    return Model.createHash(password);
                }
            })
            .then(function (hash) {
                return Model.User({
                    username: username,
                    password: hash
                });
            })
            .then(function (averageJoe) {
                return averageJoe.save();
            })
            .then(function () {
                res.json({
                    success: true,
                    message: 'User registration successful'
                });
            })
            .catch(function (err) {
                if (err !== 'Error' && err) {
                    console.log(err);
                    res.status(500).json({
                        success: false,
                        message: 'Something happened at our end. Check back after sometime.'
                    });
                }
            });
    }
});

module.exports = router;
