var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var config = require('./../models/config');
var Model = require('./../models/model');
var utility = require('./../utilities/utilities');

/* jshint ignore:start */
router.post('/login', async(req, res) => {
    /* jshint ignore:end */
    var username = req.body.username;
    var password = req.body.password;
    var usernameRegex = utility.usernameRegex;

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
            }).exec();
            if (!user) {
                return res.json({
                    success: false,
                    message: 'User authentication failed'
                });
            } else {
                let isMatch = Model.validatePassword(password, user.password);
                if (!isMatch)
                    return res.json({
                        success: false,
                        message: 'User authentication failed'
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
                    token: secureToken
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Something happened at our end. Check back after sometime.'
            });
        }
    }
    /* jshint ignore:start */
});

router.post('/register', async(req, res) => {
    /* jshint ignore:end */
    var username = req.body.username;
    var password = req.body.password;
    var rePassword = req.body.rePassword;
    var usernameRegex = utility.usernameRegex;

    if (!username || !password || typeof(username) !== 'string' ||
        typeof(password) !== 'string' || !rePassword || typeof rePassword !== 'string' ||
        !usernameRegex.test(username))
        return res.json({
            success: false,
            message: 'Incorrect credentials format'
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
            }).exec();
            if (user) {
                return res.json({
                    success: false,
                    message: 'User is already registered. Please select another username.'
                });
            }

            let hash = await Model.createHash(password);
            let averageJoe = await Model.User({
                username: username,
                password: password
            });
            await averageJoe.save();
            res.json({
                success: true,
                message: 'User registration successful'
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Something happened at our end. Check back after sometime.'
            });
        }
    }
    /* jshint ignore:start */
});
/* jshint ignore:end */

module.exports = router;