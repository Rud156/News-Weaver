<template>
    <div style="width: 100%; min-height: 100%;">
        <el-card v-if="allNews.length <= 0" style="max-width: 480px; margin: 0 auto">
            <div slot="header" class="clearfix" style="text-align: center">
                <icon name="bell-o" scale="5"></icon>
                <br />
                <span style="font-size: 25px">No Feeds To Show Right Now...</span>
            </div>
        </el-card>
        <div v-else>
            <el-row :gutter="20" style="padding: 21px; margin: 0">
                <news-card v-for="news in allNews" :key="news.hash" :news="news" :favourite="addNewsToFavourite"></news-card>
            </el-row>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import { mapGetters, mapMutations } from 'vuex';
    import newsCard from './sub-components/NewsCard.vue';

    export default {
        props: {
            id: {
                type: String
            }
        },
        components: {
            newsCard
        },
        data() {
            return {
                allNews: []
            };
        },
        watch: {
            '$route'(to, from) {
                this.loadAllFeeds();
            }
        },
        mounted() {
            this.loadAllFeeds();
        },
        methods: {
            ...mapGetters([
                'getToken'
            ]),
            ...mapMutations([
                'openModal'
            ]),
            loadAllFeeds() {
                var token = this.getToken();
                var feedURL = '';
                switch (this.id) {
                    case 'all_news':
                        feedURL = `http://localhost:3000/user/all_feed_news?token=${token}`;
                        break;
                    default:
                        feedURL = `http://localhost:3000/user/feed_news?token=${token}&hash=${this.id}`;
                        break;
                }

                axios.get(feedURL)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success)
                            this.allNews = data.news;
                        else
                            this.displayMessage(data.message);
                    })
                    .catch((error) => {
                        this.handleError(error);
                    });
            },
            addNewsToFavourite(news) {
                var URL = news.URL;
                var category = news.category;
                var date = news.date;
                var description = news.description;
                var image = news.image;
                var summary = news.summary;
                var title = news.title;

                var feedNews = {
                    URL: URL,
                    title: title,
                    description: description,
                    image: image,
                    category: category,
                    summary: summary,
                    date: date
                };

                axios.post(`http://localhost:3000/user/save_favourite?token=${this.getToken()}`,
                    {
                        feedNews: feedNews
                    })
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        this.displayMessage(data.message);
                    })
                    .catch((err) => {
                        this.handleError(err);
                    });
            },
            handleError(error) {
                console.log(error);
                this.openModal('Something went wrong. Please try again');
            },
            displayMessage(message) {
                this.openModal(message);
            }
        }
    };

</script>