<template>
    <v-container grid-list-md text-xs-center>
        <EmptyFeed
            v-if="readingList.length <= 0 && !loading"
            heading="No results found"
            description="I'm sorry but it looks like you have not added anything to read later. Add a few then check back."
        >
        </EmptyFeed>
        <v-layout row wrap>
            <NewsCard
                v-for="(item, index) in readingList"
                :item="item"
                :viewNews="viewNews"
                :key="item.hash"
                :index="index"
                :className="'one-fifth'"
            >
                <div class="one-fifth" slot="slot_1">
                    <v-btn
                        class="orange--text"
                        flat
                        icon
                        @click.stop="markNewsAsRead(item, index)"
                    >
                        <v-icon class="orange--text">
                            {{ item.read ? 'fa-check-square' : 'fa-check-square-o' }}
                        </v-icon>
                    </v-btn>
                </div>
                <div class="one-fifth" slot="slot_2">
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
                <div class="one-fifth" slot="slot_3">
                    <v-btn
                        class="red--text"
                        flat
                        icon
                        @click.stop="deleteNewsFromReadingList(item)"
                    >
                        <v-icon class="red--text">fa-trash-o</v-icon>
                    </v-btn>
                </div>
            </NewsCard>
        </v-layout>
        <v-progress-circular
            indeterminate
            class="green--text"
            v-if="loading"
            style="margin-top: 21px"
        >
        </v-progress-circular>
        <NewsView
            :showModal="showNewsModal"
            :item="selectedNews"
            :closeModal="closeNewsModal"
        >
            <v-btn
                slot="slot_1"
                flat
                class="orange--text"
                :input-value="true"
                @click.stop="markNewsAsRead(selectedNews, selectedNewsIndex)"
            >
                <v-icon>
                    {{ selectedNews.read ? 'fa-check-square' : 'fa-check-square-o' }}
                </v-icon>
            </v-btn>
            <v-btn
                slot="slot_2"
                flat
                class="pink--text"
                :input-value="true"
                @click.stop="saveNewsAsFavourite(selectedNews, selectedNewsIndex)"
            >
                <v-icon>
                    {{ selectedNews.favourite ? 'fa-heart' : 'fa-heart-o' }}
                </v-icon>
            </v-btn>
            <v-btn
                slot="slot_3"
                flat
                class="red--text"
                :input-value="true"
                @click.stop="deleteNewsFromReadingList(selectedNews)"
            >
                <v-icon>
                    fa-trash-o
                </v-icon>
            </v-btn>
        </NewsView>
    </v-container>
</template>

<script>
    import {
        getReadingList,
        markAsRead,
        removeFromReadingList,
        addToFavourites
    } from './../api/api';
    import EmptyFeed from './sub-components/EmptyFeed.vue';
    import NewsCard from './sub-components/NewsCard.vue';
    import NewsView from './sub-components/NewsView.vue';

    export default {
        data() {
            return {
                readingList: [],
                selectedNews: {},
                selectedNewsIndex: -1,
                showNewsModal: false,
                loading: false
            };
        },
        components: {
            NewsCard,
            NewsView,
            EmptyFeed
        },
        watch: {
            '$route' () {
                this.fetchReadingList();
                this.readingList = [];
            }
        },
        mounted() {
            this.fetchReadingList();
            this.readingList = [];
        },
        methods: {
            fetchReadingList() {
                this.loading = true;
                getReadingList()
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                let favourites = new Set(data.favourites);

                                let readingList = data.news.map(element => {
                                    return {
                                        ...element,
                                        favourite: favourites.has(element.newsHash)
                                    };
                                });
                                this.readingList.push(...readingList);
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }
                        this.loading = false;
                    });
            },
            saveNewsAsFavourite(news, index) {
                addToFavourites(news, news.newsHash)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.readingList[index].favourite = true;

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
            deleteNewsFromReadingList(item) {
                var hash = item.hash;
                removeFromReadingList(hash)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.readingList = this.readingList.filter(element => {
                                    return element.hash !== hash;
                                });
                                this.closeNewsModal();
                                this.$emit('displayMessage', 'success', data.message);
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }
                    });
            },
            markNewsAsRead(item, index) {
                markAsRead(item.hash)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                if (this.selectedNews.read !== undefined)
                                    this.selectedNews.read = true;
                                this.readingList[index].read = true;

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
