var loadDatabase = require('./utilities/load-news');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var config = require('./models/config');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.connect(config.database);
mongoose.connect('mongodb://rud156:1234@ds032887.mlab.com:32887/news-weaver');
var db = mongoose.connection;
db.on('error', function (err) {
    console.log(err);
});
db.on('connected', function () {
    console.log('Successfully Connected');
});
db.on('disconnected', function () {
    console.log('Database Disconnected');
});
loadDatabase();

var index = require('./routes/index');
var users = require('./routes/users');
var feeds = require('./routes/feed');
var userFeedDetails = require('./routes/user-feeds');
var userReadingList = require('./routes/user-reading-list');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', index);
app.use('/auth', users);
app.use('/user', feeds);
app.use('/user', userFeedDetails);
app.use('/user', userReadingList);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
