var FeedParser = require('feedparser');
var request = require('request');
var cheerio = require('cheerio');
var crypto = require('crypto');
var moment = require('moment');
const htmlEntites = require('html-entities');

var Model = require('./../models/model');

const minutes = 5;
const interval = minutes * 60 * 1000;
var dataReceivedCount = 0;
var maxDataToReceive;
const maxNewsPerFeed = 470;
const OPTIONS = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
};

function getDataBases() {
    return Model.FeedSchema.find({}).exec()
        .then(function(feeds) {
            maxDataToReceive = feeds.length;
            console.log('Total number of feeds: ', maxDataToReceive);
            return feeds;
        })
        .catch(function(error) {
            console.log(error);
            return [];
        });
}

function getFeedResults(feedURL, hash, category, callback) {
    var feedResult = [];
    console.log('Feed URL: ', feedURL);

    var feedParser = new FeedParser();
    var requestError = false;

    request({
            url: feedURL,
            maxRedirects: 3
        })
        .on('response', function(res) {
            if (res.statusCode !== 200) {
                console.log('Invalid status code');
                requestError = true;
                callback({
                    feed: [],
                    hash: hash,
                    category: category,
                    feedURL: feedURL
                });
            } else {
                this.pipe(feedParser);
            }
        })
        .on('error', function(error) {
            console.log(error);
            requestError = true;
            callback({
                feed: [],
                hash: hash,
                category: category,
                feedURL: feedURL
            });
        });

    feedParser
        .on('readable', function() {
            if (requestError) {
                return;
            } else {
                var stream = this;
                var item;
                while ((item = stream.read()) !== null)
                    feedResult.push(item);
            }
        })
        .on('end', function() {
            if (requestError)
                return;
            callback({
                feed: feedResult,
                hash: hash,
                category: category,
                feedURL: feedURL
            });
        })
        .on('error', function(error) {
            console.log(error);
            callback({
                feed: [],
                hash: hash,
                category: category,
                feedURL: feedURL
            });
        });
}

function runAll() {
    getDataBases()
        .then(function(feeds) {
            if (feeds.length !== 0) {
                /* jshint loopfunc: true */
                for (let j = 0; j < feeds.length; j++)
                    getFeedResults(feeds[j].feedURL, feeds[j].hash, feeds[j].category,
                        function(data) {

                            console.log('Feed length: ', data.feed.length);
                            var feedHash = data.hash;
                            var slicedNews;
                            Model.FeedNews.find({
                                    feedHash: feedHash
                                }).sort({
                                    date: -1
                                }).exec()
                                .then(function(news) {
                                    slicedNews = news.slice(0, maxNewsPerFeed);
                                    return Model.FeedNews.remove({
                                        feedHash: feedHash
                                    }).exec();
                                })
                                .then(function() {
                                    try {
                                        var mappedArray = slicedNews.map(function(element) {
                                            return {
                                                hash: element.hash,
                                                feedHash: element.feedHash,
                                                title: element.title,
                                                description: element.description,
                                                image: element.image,
                                                URL: element.URL,
                                                summary: element.summary,
                                                date: element.date,
                                                category: element.category
                                            };
                                        });
                                        var resultDictionary = {};
                                        console.log('Length of mapped array: ', mappedArray.length);
                                        for (let i = 0; i < mappedArray.length; i++)
                                            resultDictionary[mappedArray[i].hash] = mappedArray[i];
                                        for (let i = 0; i < data.feed.length; i++) {
                                            let title = data.feed[i].title;
                                            let description = data.feed[i].description;
                                            let URL = data.feed[i].link;
                                            let summary = data.feed[i].summary;
                                            let category = data.category;
                                            var date = moment(data.feed[i].pubDate).utc().toDate();
                                            var image = '';
                                            let $ = cheerio.load(data.feed[i].description);
                                            image = $('img').attr('src');
                                            if (!image)
                                                image = 'http://localhost:3000/images/place-holder.png';
                                            else {
                                                let startIndex = description.indexOf('img') - 1;
                                                let endIndex = startIndex + 1;
                                                for (let k = startIndex; k < description.length; k++)
                                                    if (description[k] === '>') {
                                                        endIndex = k;
                                                        break;
                                                    }
                                                let array = description.split('');
                                                array.splice(startIndex, endIndex - startIndex + 1);
                                                description = array.join('');

                                                startIndex = summary.indexOf('img') - 1;
                                                endIndex = startIndex + 1;
                                                for (let k = startIndex; k < summary.length; k++)
                                                    if (summary[k] === '>') {
                                                        endIndex = k;
                                                        break;
                                                    }
                                                array = summary.split('');
                                                array.splice(startIndex, endIndex - startIndex + 1);
                                                summary = array.join('');
                                            }


                                            let hash = crypto.
                                            createHash('sha256').update(title + URL).digest('hex');

                                            if (!(hash in resultDictionary))
                                                resultDictionary[hash] = {
                                                    hash: hash,
                                                    feedHash: feedHash,
                                                    title: title,
                                                    description: description,
                                                    URL: URL,
                                                    summary: summary,
                                                    category: category,
                                                    image: image,
                                                    date: date
                                                };
                                        }

                                        let finalValues = Object.values(resultDictionary);
                                        console.log(finalValues.length);
                                        let promiseArray = [];
                                        for (let i = 0; i < finalValues.length; i++) {
                                            promiseArray.
                                            push(Model.FeedNews.findOneAndUpdate({
                                                    hash: finalValues[i].hash
                                                }, finalValues[i],
                                                OPTIONS).exec());
                                        }
                                        return Promise.all(promiseArray);
                                    } catch (error) {
                                        console.log('Error occurred in try part');
                                        console.log(error);
                                        return Promise.reject('Error');
                                    }
                                })
                                .then(function() {
                                    dataReceivedCount++;
                                    console.log('Current Set Of News Saved');
                                    console.log('Data received: ', dataReceivedCount);
                                    console.log('Max Data:', maxDataToReceive);
                                    if (dataReceivedCount === maxDataToReceive) {
                                        dataReceivedCount = 0;
                                        setTimeout(runAll, interval);
                                    }
                                })
                                .catch(function(err) {
                                    if (err) {
                                        console.log('Interior Error Occurred');
                                        console.log(err);
                                    }

                                    dataReceivedCount++;

                                    console.log('Data received: ', dataReceivedCount);
                                    console.log('Max Data:', maxDataToReceive);
                                    if (dataReceivedCount === maxDataToReceive) {
                                        dataReceivedCount = 0;
                                        setTimeout(runAll, interval);
                                    }
                                });
                        });

            } else if (feeds.length === 0) {
                setTimeout(runAll, interval);
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

module.exports = runAll;