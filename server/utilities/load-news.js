var FeedParser = require('feedparser');
var request = require('request');
var cheerio = require('cheerio');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/NewsWeaver');
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

var Model = require('./../models/model');

var minutes = 0.1;
var interval = minutes * 60 * 1000;
var dataReceivedCount = 0;
var maxDataToReceive;

function getDataBases() {
    return Model.FeedSchema.find({}).exec()
        .then(function (feeds) {
            maxDataToReceive = feeds.length;
            return feeds;
        })
        .catch(function (error) {
            console.log(error);
            return [];
        });
}

function getFeedResults(feedURL, hash, category, callback) {
    var feedResult = [];
    console.log('Feed URL: ', feedURL);

    var feedParser = new FeedParser();
    var requestError = false;

    request(feedURL)
        .on('response', function (res) {
            if (res.statusCode !== 200) {
                console.log('Invalid status code');
                requestError = true;
            }
            else {
                this.pipe(feedParser);
            }
        })
        .on('error', function (error) {
            console.log(error);
            requestError = true;
        });

    feedParser
        .on('readable', function () {
            if (requestError) {
                callback({ feed: [], hash: hash, category: category, feedURL: feedURL });
                return;
            }
            else {
                var stream = this;
                var item;
                while ((item = stream.read()) !== null)
                    feedResult.push(item);
            }
        })
        .on('end', function () {
            callback({ feed: feedResult, hash: hash, category: category, feedURL: feedURL });
        })
        .on('error', function (error) {
            console.log(error);
            callback({ feed: [], hash: hash, category: category, feedURL: feedURL });
        });
}

function runAll() {
    getDataBases()
        .then(function (feeds) {
            if (feeds) {
                /*jshint loopfunc: true */
                for (let i = 0; i < feeds.length; i++)
                    getFeedResults(feeds[i].feedURL, feeds[i].hash, function (data) {
                        dataReceivedCount++;

                        // var hash = data.hash;
                        // console.log(hash);
                        // var title = data.feed[0].title;
                        // var description = data.feed[0].description;
                        // var URL = data.feed[0].link;
                        // var summary = data.feed[0].summary;
                        // var date = moment(data.feed[0].pubDate).utc().toDate();
                        // var category = data.category;
                        // var image = '';
                        // let $ = cheerio.load(data.feed[0].description);
                        // image = $('img').attr('src');
                        // if (!image)
                        //     image = 'http://localhost:3000/place-holder.png';

                        // var feeds = data.feed;
                        // Model.FeedNews.find({})
                        // TODO: Complete this function


                        if (dataReceivedCount === maxDataToReceive) {
                            dataReceivedCount = 0;
                            setTimeout(runAll, interval);
                        }
                    });

            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

runAll();