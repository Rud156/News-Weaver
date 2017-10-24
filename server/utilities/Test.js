const Model = require('./../models/model');
const mongoose = require('mongoose');
const config = require('./../models/config');
const Entities = require('html-entities').AllHtmlEntities;
const htmlEntities = new Entities();
mongoose.Promise = global.Promise;

mongoose.connect(config.database, {
        useMongoClient: true
    })
    .then(async() => {
        console.log('MongoDB Successfully Connected');
        let feedNews = await Model.FeedNews.find({}).exec();
        let promiseArray = [];
        for (let i = 0; i < feedNews.length; i++) {
            feedNews[i].title = htmlEntities.encode(feedNews[i].title);
            feedNews[i].description = htmlEntities.encode(feedNews[i].description);
            feedNews[i].summary = htmlEntities.encode(feedNews[i].summary);
            feedNews[i].image = htmlEntities.encode(feedNews[i].image);
            promiseArray.push(feedNews[i].save());
        }
        await Promise.all(promiseArray);
        console.log('Feed News Updated');

        let favourites = await Model.Favourite.find({}).exec();
        promiseArray.length = 0;
        for (let i = 0; i < favourites.length; i++) {
            favourites[i].title = htmlEntities.encode(favourites[i].title);
            favourites[i].description = htmlEntities.encode(favourites[i].description);
            favourites[i].summary = htmlEntities.encode(favourites[i].summary);
            favourites[i].image = htmlEntities.encode(favourites[i].image);
            promiseArray.push(favourites[i].save());
        }
        await Promise.all(promiseArray);
        console.log('Favourites Updated');

        let readingNews = await Model.ReadingList.find({}).exec();
        promiseArray.length = 0;
        for (let i = 0; i < readingNews.length; i++) {
            readingNews[i].title = htmlEntities.encode(readingNews[i].title);
            readingNews[i].description = htmlEntities.encode(readingNews[i].description);
            readingNews[i].summary = htmlEntities.encode(readingNews[i].summary);
            readingNews[i].image = htmlEntities.encode(readingNews[i].image);
            promiseArray.push(readingNews[i].save());
        }
        await Promise.all(promiseArray);
        console.log('ReadingList Updated');
    })
    .catch((error) => {
        console.error(error);
    });