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
    },
    feeds: [String]
});

var FeedSchema = mongoose.Schema({
    hash: {
        type: String,
        required: true,
        index: true
    },
    users: [String],
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    URL: {
        type: String,
        required: true
    },
    favicon: {
        type: String,
        required: true
    },
    feedURL: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: 'Unknown'
    }
});

var FeedNews = mongoose.Schema({
    hash: {
        type: String,
        required: true,
        index: true
    },
    feedHash: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    URL: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: [String]
});

var Favourite = mongoose.Schema({
    hash: {
        type: String,
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    title: String,
    description: String,
    image: String,
    URL: String,
    summary: String,
    date: Date,
    category: [
        String
    ]
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
    FeedSchema: mongoose.model('Feed', FeedSchema),
    FeedNews: mongoose.model('News', FeedNews),
    Favourite: mongoose.model('Favourite', Favourite),
    createHash: createHash,
    validatePassword: validatePassword
};