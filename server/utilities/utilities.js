var config = require('./../models/config');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

function encrypt(dataToEncrypt, key) {
    var cipher = crypto.createCipher('aes-256-ctr', key);
    var encryptedData = cipher.update(dataToEncrypt, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}

function decrypt(dataToDecrypt, key) {
    var deCipher = crypto.createDecipher('aes-256-ctr', key);
    var decryptedData = deCipher.update(dataToDecrypt, 'hex', 'utf8');
    decryptedData += deCipher.final('utf8');
    return decryptedData;
}

function checkAuthentication(req, res, next) {
    var secureToken = req.body.token || req.query.token || req.headers['x-access-token'];
    if (secureToken) {
        let token = decrypt(secureToken, config.secret);
        jwt.verify(token, config.secret, function(err, decodedToken) {
            if (err)
                return res.status(403).json({
                    success: false,
                    message: 'Invalid token provided. Please login to continue'
                });
            else {
                req.decoded = decodedToken;
                next();
            }
        });
    } else {
        return res.status(403).json({
            success: false,
            message: 'No token provided'
        });
    }
}

const urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const usernameRegex = /^[a-zA-Z0-9]+$/;

module.exports = {
    checkAuthentication: checkAuthentication,
    encrypt: encrypt,
    decrypt: decrypt,
    urlRegex: urlRegex,
    usernameRegex: usernameRegex
};