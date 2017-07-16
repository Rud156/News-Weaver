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
            <el-button @click="loadFeeds" style="margin-bottom: 14px" :loading="loading">Load More</el-button>
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
                allNews: [],
                loading: false
            };
        },
        watch: {
            '$route'(to, from) {
                this.resetFeedIndexCount();
                this.loadFeeds();
            }
        },
        mounted() {
            this.resetFeedIndexCount();
            this.loadFeeds();
        },
        methods: {
            ...mapGetters([
                'getToken',
                'getFeedIndexCount',
                'getBaseURL'
            ]),
            ...mapMutations([
                'incrementFeedIndex',
                'resetFeedIndexCount'
            ]),
            loadFeeds() {
                var token = this.getToken();
                var feedURL = '';
                this.loading = true;

                switch (this.id) {
                    case 'all_news':
                        feedURL = `${this.getBaseURL()}/user/all_feed_news?token=${token}&index=${this.getFeedIndexCount()}`;
                        break;
                    default:
                        feedURL = `${this.getBaseURL()}/user/feed_news?token=${token}&hash=${this.id}&index=${this.getFeedIndexCount()}`;
                        break;
                }

                axios.get(feedURL)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        this.loading = false;

                        if (data.success) {
                            if (this.getFeedIndexCount() === 0)
                                this.allNews = data.news;
                            else
                                this.allNews.push(...data.news);

                            this.incrementFeedIndex();
                        }
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

                axios.post(`${this.getBaseURL()}/user/save_favourite?token=${this.getToken()}`,
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
                if (error.response.status === 403) {
                    this.$emit('validation-failed', 'logout');
                    this.$notify({
                        type: 'warning',
                        title: 'Warning',
                        message: 'Please login again'
                    });
                    return;
                }
                console.log(error);
                this.$notify({
                    type: 'error',
                    title: 'Error',
                    message: 'Something went wrong. Please try again'
                });
            },
            displayMessage(message) {
                this.$notify({
                    type: 'info',
                    title: 'Info',
                    message: message
                });
            }
        }
    };

</script>