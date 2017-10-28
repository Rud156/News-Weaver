<template>
    <v-container grid-list-md text-xs-center>
        <EmptyFeed
            v-if="allNews.length <= 0 && !displayOneTimeLoader"
            heading="No results found"
            description="I'm sorry but nothing turned up when I searched. This might be a problem with the way the data is fetched once you add a new source. Check back in 5 mins."
        >
        </EmptyFeed>
        <v-layout row wrap>
            <NewsCard
                v-for="(item, index) in allNews"
                :item="item"
                :viewNews="viewNews"
                :key="item.hash"
                :index="index"
                :className="'one-fourth'"
            >
                <div class="one-fourth" slot="slot_1">
                    <v-btn
                        class="pink--text"
                        flat
                        icon
                        @click.stop="saveNewsAsFavourite(item, index)"
                    >
                        <v-icon class="pink--text">
                            {{ item.favourite ? 'fa-heart' : 'fa-heart-o' }}
                        </v-icon>
                    </v-btn>
                </div>
                <div class="one-fourth" slot="slot_2">
                    <v-btn
                        class="orange--text"
                        flat
                        icon
                        @click.stop="addNewsToReadingList(item)"
                    >
                        <v-icon class="orange--text">fa-book</v-icon>
                    </v-btn>
                </div>
            </NewsCard>
        </v-layout>
        <NewsView
            :showModal="showNewsModal"
            :item="selectedNews"
            :closeModal="closeNewsModal"
        >
            <v-btn
                slot="slot_1"
                flat
                class="btn--active"
                @click.stop="saveNewsAsFavourite(selectedNews, selectedNewsIndex)"
            >
                <v-icon class="pink--text">
                    {{ selectedNews.favourite ? 'fa-heart' : 'fa-heart-o' }}
                </v-icon>
            </v-btn>
            <v-btn
                slot="slot_2"
                flat
                class="btn--active"
                @click.stop="addNewsToReadingList(selectedNews)"
            >
                <v-icon class="orange--text">
                    fa-book
                </v-icon>
            </v-btn>
        </NewsView>
        <v-btn
            v-if="!displayOneTimeLoader"
            color="blue"
            :loading="loading"
            :disabled="loading"
            @click.stop="loadFeeds"
        >
            <span class="white--text button-margin">
                Load More News
            </span>
        </v-btn>
        <v-progress-circular
            indeterminate
            class="green--text"
            v-if="displayOneTimeLoader"
            style="margin-top: 21px"
        >
        </v-progress-circular>
    </v-container>
</template>

<script>
    import {
        mapGetters,
        mapMutations
    } from 'vuex';

    import {
        getAllFeeds,
        getSpecificFeed,
        addToFavourites,
        addToReadingList
    } from './../api/api';
    import EmptyFeed from './sub-components/EmptyFeed.vue';
    import NewsCard from './sub-components/NewsCard.vue';
    import NewsView from './sub-components/NewsView.vue';

    export default {
        props: {
            id: {
                type: String
            },
            displayAllNews: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                allNews: [],
                showNewsModal: false,
                selectedNews: {},
                selectedNewsIndex: -1,
                loading: false,
                displayOneTimeLoader: false
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
                this.allNews = [];
                this.displayOneTimeLoader = true;
            }
        },
        mounted() {
            this.resetFeedIndexCount();
            this.loadFeeds();
            this.allNews = [];
            this.displayOneTimeLoader = true;
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
                switch (this.displayAllNews) {
                    case true:
                        getAllFeeds(currentIndex)
                            .then(data => {
                                if (data.error === undefined) {
                                    if (data.success) {
                                        let favourites = new Set(data.user.favourites);

                                        let allNews = data.news.map(element => {
                                            return {
                                                ...element,
                                                favourite: favourites.has(element.hash)
                                            };
                                        });
                                        this.allNews.push(...allNews);

                                        if (allNews.length > 0)
                                            this.incrementFeedIndex();
                                    } else {
                                        this.$emit('displayMessage', 'warning', data.message);
                                    }
                                } else {
                                    this.$emit('displayMessage', 'error', data.error);
                                }

                                this.loading = false;
                                this.displayOneTimeLoader = false;
                            });
                        break;

                    default:
                        getSpecificFeed(currentIndex, this.id)
                            .then(data => {
                                if (data.error === undefined) {
                                    if (data.success) {
                                        let favourites = new Set(data.user.favourites);

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
                                this.displayOneTimeLoader = false;
                            });
                        break;
                }
            },
            saveNewsAsFavourite(news, index) {
                addToFavourites(news, news.hash)
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
            addNewsToReadingList(item) {
                addToReadingList(item)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
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
