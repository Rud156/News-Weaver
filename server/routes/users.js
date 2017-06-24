var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var config = require('./../models/config');
var Model = require('./../models/model');

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password || typeof (username) !== 'string' || typeof (password) !== 'string')
        return res.json({ success: false, message: 'Incorrect Credentials Format' });
    else {
        username = username.toLowerCase();
        Model.User.findOne({ username: username }, function (err, user) {
            if (err)
                throw err;

            if (!user)
                return res.json({ success: false, message: 'User Authentication Failed' });
            else {
                Model.validatePassword(password, user.password, function (err, isMatch) {
                    if (err)
                        throw err;
                    if (!isMatch)
                        return res.json({ success: false, message: 'User Authentication Failed' });
                    else {
                        var token = jwt.sign(user, config.secret, {
                            expiresIn: '2d'
                        });
                        return res.json({ success: true, token: token });
                    }
                });
            }
        });
    }
});

router.post('/register', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password || typeof (username) !== 'string' || typeof (password) !== 'string')
        return res.json({ success: false, message: 'Incorrect Credentials Format' });
    else {
        username = username.toLowerCase();
        Model.User.findOne({ username: username }, function (err, user) {
            if (err)
                throw err;
            if (user)
                return res.json({ success: false, message: 'User is already registered' });
            else {
                Model.createHash(password, function (err, hash) {
                    var averageJoe = Model.User({
                        username: username,
                        password: hash
                    });
                    averageJoe.save(function (err) {
                        if (err)
                            throw err;
                        return res.json({ success: true, message: 'User registration successfull' });
                    });
                });
            }
        });
    }
});

module.exports = router;
