var mongoose = require('mongoose');
var bcyrpt = require('bcryptjs');

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

var createHash = function (password, callback) {
    bcyrpt.genSalt(10, function (err, salt) {
        if (err)
            throw err;

        bcyrpt.hash(password, salt, callback);
    });
};

var validatePassword = function (password, hash, callback) {
    bcyrpt.compare(password, hash, callback);
};

module.exports = {
    User: mongoose.model('User', UserSchema),
    createHash: createHash,
    validatePassword: validatePassword
};