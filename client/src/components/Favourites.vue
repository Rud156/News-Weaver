<template>
    <div>
        <EmptyFeed
            v-if="favourites.length <= 0 && !loading"
            heading="No results found"
            description="I'm sorry but it looks like you have no favourites to show. Add a few and check back later."
        >
        </EmptyFeed>
        <v-layout row wrap>
            <NewsCard
                v-for="(item, index) in favourites"
                :item="item"
                :key="item.hash"
                :index="index"
                :viewNews="viewNews"
            >
                <div class="one-fourth" slot="slot_1">
                    <v-btn 
                        class="orange--text"
                        flat
                        icon
                        @click.stop="deleteNewsFromFavourite(item.hash, item.newsHash)"
                    >
                        <v-icon class="orange--text">
                            fa-trash-o
                        </v-icon>
                    </v-btn>
                </div>
                <div class="one-fourth" slot="slot_2">
                    <v-btn 
                        class="pink--text"
                        flat
                        icon
                        @click.stop="editNews(item, index)"
                    >
                        <v-icon class="pink--text">
                         fa-pencil
                        </v-icon>
                    </v-btn>
                </div>
            </NewsCard>
        </v-layout>
        <NewsView
            :showModal="showNewsModal"
            :closeModal="closeNewsModal"
            :item="selectedNews"
        >
            <v-btn 
                class="orange--text"
                flat
                :value="true"
                slot="slot_1"
                @click.stop="deleteNewsFromFavourite(selectedNews.hash, selectedNews.newsHash)"
            >
                <span>Delete</span>
                <v-icon class="orange--text">
                    fa-trash-o
                </v-icon>
            </v-btn>
            <v-btn 
                class="pink--text"
                flat
                :value="true"
                slot="slot_2"
                @click.stop="editNews(selectedNews, selectedNewsIndex)"
            >
                <span>Edit</span>
                <v-icon class="pink--text">
                    fa-pencil
                </v-icon>
            </v-btn>
        </NewsView>
        <EditFavourite
            :editableNews="editableNews"
            :closeModal="closeEditableNewsModal"
            :index="editableNewsIndex"
            :showModal="showEditableNewsModal"
            :saveEditedNews="saveEditedNews"
        >
        </EditFavourite>
        <v-btn
            class="blue darken-2 white--text button-margin"
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
    import EditFavourite from './sub-components/EditFavourite.vue';

    export default {
        data() {
            return {
                favourites: [],
                showNewsModal: false,
                showEditableNewsModal: false,
                editableNews: {},
                editableNewsIndex: -1,
                loading: false,
                selectedNews: {},
                selectedNewsIndex: -1
            };
        },
        components: {
            NewsCard,
            NewsView,
            EmptyFeed,
            EditFavourite
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
                this.showNewsModal = true;
                this.selectedNews = item;
                this.selectedNewsIndex = index;
            },
            editNews(item, index) {
                this.editableNews = Object.assign({}, item);
                this.editableNewsIndex = index;
                this.closeNewsModal();
                this.showEditableNewsModal = true;
            },
            saveEditedNews(item, index) {
                saveEditedFavourite(item)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.favourites[index] = item;
                                this.closeEditableNewsModal();
                                this.$emit('displayMessage', 'success', data.message);
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }
                    });
            },
            deleteNewsFromFavourite(hash, newsHash) {
                deleteFavourite(hash, newsHash)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.favourites = this.favourites.filter(element => {
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
            closeNewsModal() {
                this.showNewsModal = false;
                this.selectedNews = {};
                this.selectedNewsIndex = -1;
            },
            closeEditableNewsModal() {
                this.showEditableNewsModal = false;
                this.editableNews = {};
                this.editableNewsIndex = -1;
            }
        }
    };
</script>