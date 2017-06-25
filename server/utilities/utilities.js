var config = require('./../models/config');
var jwt = require('jsonwebtoken');

function checkAuthentication(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decodedToken) {
            if (err)
                return res.json({
                    success: false,
                    message: 'Invalid token provided. Please login to continue'
                });
            else {
                req.decoded = decodedToken;
                next();
            }
        });
    }
    else {
        return res.status(403).send({ success: false, message: 'No token provided' });
    }
}

module.exports = {
    checkAuthentication: checkAuthentication
};