<template>
    <div>
        <EmptyFeed
            v-if="allNews.length <= 0"
            heading="No results found"
            description="I'm sorry but nothing turned up when I searched. This might be a problem with the way the data is fetched once you add a new source. Check back in 5 mins."
        >
        </EmptyFeed>
        <div class="masonry">
            <NewsCard 
                v-for="(item, index) in allNews" 
                :item="item"
                :viewNews="viewNews"
                :key="item.hash"
                :addNewsAsFavourite="saveNewsAsFavourite"
                :index="index"
            >
            </NewsCard>
        </div>
        <NewsView
            :showModal="showNewsModal"
            :item="selectedNews"
            :closeModal="closeNewsModal"
            :addNewsAsFavourite="saveNewsAsFavourite"
            :index="selectedNewsIndex"
        >
        </NewsView>
        <v-btn
            class="blue darken-2 white--text"
            :loading="loading"
            :disabled="loading"
            @click.stop="loadFeeds"
            flat
        >
            Load More News
        </v-btn>
    </div>
</template>

<script>
    import {
        mapGetters,
        mapMutations
    } from 'vuex';

    import {
        getAllFeeds,
        getSpecificFeed,
        addToFavourites
    } from './../api/api';
    import EmptyFeed from './sub-components/EmptyFeed.vue';
    import NewsCard from './sub-components/NewsCard.vue';
    import NewsView from './sub-components/NewsView.vue';

    export default {
        props: {
            id: {
                type: String
            }
        },
        data() {
            return {
                allNews: [],
                showNewsModal: false,
                selectedNews: {},
                selectedNewsIndex: -1,
                loading: false
            };
        },
        components: {
            EmptyFeed,
            NewsCard,
            NewsView
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

                let currentIndex = this.getFeedIndexCount();
                switch (this.id) {
                    case 'all_news':
                        getAllFeeds(currentIndex)
                            .then(data => {
                                if (data.error === undefined) {
                                    if (data.success) {
                                        let favourites = new Set(data.favourites);

                                        let allNews = data.news.map(element => {
                                            return {
                                                ...element,
                                                favourite: favourites.has(element.hash)
                                            };
                                        });
                                        this.allNews.push(...allNews);

                                        this.incrementFeedIndex();
                                    } else {
                                        this.$emit('displayMessage', 'warning', data.message);
                                    }
                                } else {
                                    this.$emit('displayMessage', 'error', data.error);
                                }

                                this.loading = false;
                            });
                        break;

                    default:
                        getSpecificFeed(currentIndex, this.id)
                            .then(data => {
                                if (data.error === undefined) {
                                    if (data.success) {
                                        let favourites = new Set(data.favourites);

                                        if (currentIndex === 0) {
                                            let allNews = data.news.map(element => {
                                                return {
                                                    ...element,
                                                    favourite: favourites.has(element.hash)
                                                };
                                            });
                                            this.allNews = allNews;

                                        } else {
                                            let newNews = data.news.map(element => {
                                                return {
                                                    ...element,
                                                    favourite: favourites.has(element.hash)
                                                };
                                            });
                                            this.allNews.push(...newNews);
                                        }

                                        this.incrementFeedIndex();
                                    } else {
                                        this.$emit('displayMessage', 'warning', data.message);
                                    }
                                } else {
                                    this.$emit('displayMessage', 'error', data.error);
                                }

                                this.loading = false;
                            });
                        break;
                }
            },
            saveNewsAsFavourite(news, index) {
                addToFavourites(news)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.allNews[index].favourite = true;

                                if (this.selectedNews.favourite !== undefined) {
                                    this.selectedNews.favourite = true;
                                }

                                this.$emit('displayMessage', 'success', data.message);
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }
                    });
            },
            viewNews(item, index) {
                this.showNewsModal = true;
                this.selectedNews = item;
                this.selectedNewsIndex = index;
            },
            closeNewsModal() {
                this.showNewsModal = false;
                this.selectedNews = {};
                this.selectedNewsIndex = -1;
            }
        }
    };
</script>