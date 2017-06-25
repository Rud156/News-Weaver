var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true
    }
});

var createHash = function (password) {
    return bcrypt.genSalt(10)
        .then(function (salt) {
            return bcrypt.hash(password, salt);
        });
};

var validatePassword = function (password, hash) {
    return bcrypt.compare(password, hash);
};

module.exports = {
    User: mongoose.model('User', UserSchema),
    createHash: createHash,
    validatePassword: validatePassword
};