<template>
    <div>
        <EmptyFeed
            v-if="favourites.length <= 0"
            heading="No results found"
            description="I'm sorry but it looks like you have no favourites to show. Add a few and check back later."
        >
        </EmptyFeed>
        <div class="masonry">
            <NewsCard
                v-for="(item, index) in favourites"
                :item="item"
                :key="item.hash"
                :index="index"
                :viewNews="viewNews"
            >
            </NewsCard>
        </div>
        <v-btn
            class="blue darken-2 white--text"
            :loading="loading"
            :disabled="loading"
            @click.stop="fetchFavourites"
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
        getFavourites,
        deleteFavourite,
        saveEditedFavourite
    } from './../api/api';
    import EmptyFeed from './sub-components/EmptyFeed.vue';
    import NewsCard from './sub-components/NewsCard.vue';
    import NewsView from './sub-components/NewsView.vue';

    export default {
        data() {
            return {
                favourites: [],
                showModal: false,
                editableNews: null,
                loading: false,
                selectedNews: {},
                index: -1
            };
        },
        components: {
            NewsCard,
            NewsView,
            EmptyFeed
        },
        watch: {
            '$route' () {
                this.resetFeedIndexCount();
                this.fetchFavourites();
            }
        },
        mounted() {
            this.resetFeedIndexCount();
            this.fetchFavourites();
        },
        methods: {
            ...mapGetters([
                'getFeedIndexCount',
            ]),
            ...mapMutations([
                'incrementFeedIndex',
                'resetFeedIndexCount'
            ]),
            fetchFavourites() {
                this.loading = true;
                getFavourites(this.getFeedIndexCount())
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.favourites.push(...data.favourites);
                                this.incrementFeedIndex();
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }

                        this.loading = false;
                    });
            },
            viewNews(item, index) {
                console.log(item);
            }
        }
    };
</script>