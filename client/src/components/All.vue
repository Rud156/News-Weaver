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
                <newsCard v-for="news in allNews" :key="news.hash" :news="news" :favourite="favourites.has(news.hash)" :addToFavourite="true"></newsCard>
            </el-row>
            <el-button @click="loadFeeds" style="margin-bottom: 14px" :loading="loading">Load More</el-button>
        </div>
    </div>
</template>

<script>
    import {
        mapGetters,
        mapMutations
    } from 'vuex';

    import {
        displayMessage,
        getAllFeeds,
        getSpecificFeed
    } from './../api/api';
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
                loading: false,
                favourites: null
            };
        },
        watch: {
            '$route' () {
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
                'getFeedIndexCount',
            ]),
            ...mapMutations([
                'incrementFeedIndex',
                'resetFeedIndexCount'
            ]),
            loadFeeds() {
                this.loading = true;

                switch (this.id) {
                    case 'all_news':
                        getAllFeeds(this.getFeedIndexCount())
                            .then((data) => {
                                this.loading = false;

                                if (data.success) {
                                    if (this.getFeedIndexCount() === 0)
                                        this.allNews = data.news;
                                    else
                                        this.allNews.push(...data.news);
                                    this.favourites = new Set(data.favourites);

                                    this.incrementFeedIndex();
                                } else
                                    displayMessage(data.message);
                            });
                        break;
                    default:
                        getSpecificFeed(this.getFeedIndexCount(), this.id)
                            .then((data) => {
                                this.loading = false;

                                if (data.success) {
                                    if (this.getFeedIndexCount() === 0)
                                        this.allNews = data.news;
                                    else
                                        this.allNews.push(...data.news);
                                    this.favourites = new Set(data.favourites);

                                    this.incrementFeedIndex();
                                } else
                                    displayMessage(data.message);
                            });
                        break;
                }
            }
        }
    };
</script>