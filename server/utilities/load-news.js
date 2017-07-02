var FeedParser = require('feedparser');
var request = require('request');
var cheerio = require('cheerio');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Model = require('./../models/model');

var minutes = 0.5;
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

function getFeedResults(feedUrl, hash, callback) {
    var feedResult = [];
    console.log('Feed URL: ', feedUrl);

    var feedParser = new FeedParser();
    var requestError = false;

    request(feedUrl)
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
                callback({ feed: [], hash: hash });
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
            callback({ feed: feedResult, hash: hash });
        })
        .on('error', function (error) {
            console.log(error);
            callback({ feed: [], hash: hash });
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
                        var hash = data.hash;
                        console.log(hash);
                        if (dataReceivedCount === maxDataToReceive)
                            setTimeout(runAll, interval);
                    });

            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

runAll();