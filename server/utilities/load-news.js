const FeedParser = require('feedparser');
const request = require('request');
const cheerio = require('cheerio');
const crypto = require('crypto');
const moment = require('moment');
const Entities = require('html-entities')
    .AllHtmlEntities;
const entities = new Entities();

const Model = require('./../models/model');

const minutes = 1;
const interval = minutes * 60 * 1000;
let dataReceivedCount = 0;
let maxDataToReceive;
const maxNewsPerFeed = 470;
const OPTIONS = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
};

const getDataBases = async() => {
    try {
        let feeds = await Model.FeedSchema.find({})
            .exec();
        maxDataToReceive = feeds.length;
        console.log('Total number of feeds: ', maxDataToReceive);
        return feeds;
    } catch (error) {
        console.log(error);
        return [];
    }
};

const getFeedResults = (feedURL, hash, category, callback) => {
    let feedResult = [];
    console.log('Feed URL: ', feedURL);

    let feedParser = new FeedParser();
    let requestError = false;

    request({
            url: feedURL,
            maxRedirects: 3
        })
        .on('response', function (res) {
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
        .on('error', function (error) {
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
        .on('readable', function () {
            if (requestError) {
                return;
            } else {
                let stream = this;
                let item;
                while ((item = stream.read()) !== null)
                    feedResult.push(item);
            }
        })
        .on('end', function () {
            if (requestError)
                return;
            callback({
                feed: feedResult,
                hash: hash,
                category: category,
                feedURL: feedURL
            });
        })
        .on('error', function (error) {
            console.log(error);
            callback({
                feed: [],
                hash: hash,
                category: category,
                feedURL: feedURL
            });
        });
};

const runAll = async() => {
    try {
        let feeds = await getDataBases();
        if (feeds.length !== 0) {
            for (let j = 0; j < feeds.length; j++) {
                getFeedResults(feeds[j].feedURL, feeds[j].hash, feeds[j].category, async(data) => {

                    console.log('Feed length: ', data.feed.length);
                    let feedHash = data.hash;
                    let slicedNews;

                    let news = await Model.FeedNews.find({
                            feedHash: feedHash
                        })
                        .sort({
                            date: -1
                        })
                        .exec();

                    slicedNews = news.slice(0, maxNewsPerFeed);
                    await Model.FeedNews.remove({
                            feedHash: feedHash
                        })
                        .exec();

                    try {
                        let mappedArray = slicedNews.map(function (element) {
                            return {
                                hash: element.hash,
                                feedHash: element.feedHash,
                                title: entities.decode(element.title),
                                description: entities.decode(element.description),
                                image: entities.decode(element.image),
                                URL: element.URL,
                                summary: entities.decode(element.summary),
                                date: element.date,
                                category: element.category
                            };
                        });
                        let resultDictionary = {};

                        console.log('Length of mapped array: ', mappedArray.length);
                        for (let i = 0; i < mappedArray.length; i++)
                            resultDictionary[mappedArray[i].hash] = mappedArray[i];

                        for (let i = 0; i < data.feed.length; i++) {
                            let title = data.feed[i].title;
                            let description = data.feed[i].description;
                            let URL = data.feed[i].link;
                            let summary = data.feed[i].summary;
                            let category = data.category;
                            let date = moment(data.feed[i].pubDate)
                                .utc()
                                .toDate();
                            let image = '';
                            let $ = cheerio.load(data.feed[i].description);
                            image = $('img')
                                .attr('src');
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
                            createHash('sha256')
                                .update(entities.encode(title) + URL)
                                .digest('hex');

                            if (!(hash in resultDictionary))
                                resultDictionary[hash] = {
                                    hash: hash,
                                    feedHash: feedHash,
                                    title: entities.encode(title),
                                    description: entities.encode(description),
                                    URL: URL,
                                    summary: entities.encode(summary),
                                    category: category,
                                    image: entities.encode(image),
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
                                    OPTIONS)
                                .exec());
                        }
                        await Promise.all(promiseArray);

                        dataReceivedCount++;
                        console.log('Current Set Of News Saved');
                        console.log('Data received: ', dataReceivedCount);
                        console.log('Max Data:', maxDataToReceive);
                        if (dataReceivedCount === maxDataToReceive) {
                            dataReceivedCount = 0;
                            setTimeout(runAll, interval);
                        }
                        dataReceivedCount++;
                    } catch (error) {
                        console.log('Error occurred in try part');
                        console.log(error);
                    }

                });
            }
        } else if (feeds.length === 0) {
            setTimeout(runAll, interval);
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = runAll;
