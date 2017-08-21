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
                v-for="item in allNews" 
                :item="item"
                :viewNews="viewNews"
                :key="item.hash"
            >
            </NewsCard>
        </div>
        <NewsView
            :showModal="showNewsModal"
            :item="selectedNews"
            :closeModal="closeNewsModal"
        >
        </NewsView>
    </div>
</template>

<script>
    import {
        mapGetters,
        mapMutations
    } from 'vuex';

    import {
        getAllFeeds,
        getSpecificFeed
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
                selectedNews: {}
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
                let currentIndex = this.getFeedIndexCount();
                switch (this.id) {
                    case 'all_news':
                        getAllFeeds(currentIndex)
                            .then(data => {
                                if (data.error === undefined) {
                                    if (data.success) {
                                        if (currentIndex === 0)
                                            this.allNews = data.news;
                                        else
                                            this.allNews.push(...data.news);
                                        this.incrementFeedIndex();
                                    } else {
                                        this.$emit('displayMessage', 'warning', data.message);
                                    }
                                } else {
                                    this.$emit('displayMessage', 'error', data.error);
                                }
                            });
                        break;

                    default:
                        getSpecificFeed(currentIndex, this.id)
                            .then(data => {
                                if (data.error === undefined) {
                                    if (data.success) {
                                        if (currentIndex === 0)
                                            this.allNews = data.news;
                                        else
                                            this.allNews.push(...data.news);
                                        this.incrementFeedIndex();
                                    } else {
                                        this.$emit('displayMessage', 'warning', data.message);
                                    }
                                } else {
                                    this.$emit('displayMessage', 'error', data.error);
                                }
                            });
                        break;
                }
            },
            viewNews(item) {
                this.showNewsModal = true;
                this.selectedNews = item;
            },
            closeNewsModal() {
                this.showNewsModal = false;
                this.selectedNews = {};
            }
        }
    };
</script>