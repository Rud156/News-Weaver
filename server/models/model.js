var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    feeds: {
        type: Array,
        default: []
    },
    favourites: {
        type: Array,
        default: []
    }
});

var FeedSchema = mongoose.Schema({
    hash: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    users: [String],
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
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
    }
});

var FeedNews = mongoose.Schema({
    hash: {
        type: String,
        required: true,
        index: true,
        unique: true
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
        index: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        index: true,
        lowercase: true
    },
    newsHash: {
        type: String,
        required: true
    },
    title: String,
    description: String,
    image: String,
    URL: String,
    summary: String,
    date: Date,
    category: [String]
});

var ReadingList = mongoose.Schema({
    hash: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    username: {
        type: String,
        index: true,
        required: true,
        lowercase: true
    },
    title: String,
    description: String,
    image: String,
    URL: String,
    summary: String,
    date: Date,
    read: Boolean
});

var createHash = function(password) {
    return bcrypt.genSalt(10)
        .then(function(salt) {
            return bcrypt.hash(password, salt);
        });
};

var validatePassword = function(password, hash) {
    return bcrypt.compare(password, hash);
};

module.exports = {
    User: mongoose.model('User', UserSchema),
    FeedSchema: mongoose.model('Feed', FeedSchema),
    FeedNews: mongoose.model('News', FeedNews),
    Favourite: mongoose.model('Favourite', Favourite),
    ReadingList: mongoose.model('ReadingList', ReadingList),
    createHash: createHash,
    validatePassword: validatePassword
};