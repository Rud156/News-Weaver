const config = require('./../models/config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function encrypt(dataToEncrypt, key) {
    let cipher = crypto.createCipher('aes256', key);
    let encryptedData = cipher.update(dataToEncrypt, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}

function decrypt(dataToDecrypt, key) {
    let deCipher = crypto.createDecipher('aes256', key);
    let decryptedData = deCipher.update(dataToDecrypt, 'hex', 'utf8');
    decryptedData += deCipher.final('utf8');
    return decryptedData;
}

function checkAuthentication(req, res, next) {
    let secureToken = req.body.token || req.query.token || req.headers['x-access-token'];
    if (secureToken) {
        try {
            let token = decrypt(secureToken, config.secret);
            jwt.verify(token, config.secret, function (err, decodedToken) {
                if (err)
                    return res.status(403)
                        .json({
                            success: false,
                            message: 'Invalid token provided. Please login to continue'
                        });
                else {
                    req.decoded = decodedToken;
                    next();
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(403)
                .json({
                    success: false,
                    message: 'Invalid token provided. Please login to continue.'
                });
        }
    } else {
        return res.status(403)
            .json({
                success: false,
                message: 'No token provided'
            });
    }
}

function stripUser(userObject) {
    return {
        username: userObject.username,
        feeds: userObject.feeds,
        favourites: userObject.favourites
    };
}

function stripFeed(feedObject) {
    return {
        hash: feedObject.hash,
        title: feedObject.title,
        description: feedObject.description,
        URL: feedObject.URL,
        favicon: feedObject.favicon,
        feedURL: feedObject.feedURL
    };
}

const urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
const usernameRegex = /^[a-zA-Z0-9]{5,20}$/;
const passwordRegex = /^[a-zA-Z0-9 +\-/*]{5,20}$/;

module.exports = {
    checkAuthentication: checkAuthentication,
    encrypt: encrypt,
    decrypt: decrypt,
    urlRegex: urlRegex,
    usernameRegex: usernameRegex,
    passwordRegex: passwordRegex,
    stripUser: stripUser,
    stripFeed: stripFeed
};
