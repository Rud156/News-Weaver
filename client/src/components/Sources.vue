<template>
    <div>
        <EmptyFeed
            v-if="sources.length <= 0 && !loading"
            heading="No results found"
            description="I'm sorry but it looks like that you have not added any feed sources as of now. Click the big green button to add a source and get started."
        >
        </EmptyFeed>

        <v-dialog v-model="showConfirmationDialog" persistent>
            <v-card>
                <v-card-title>
                    <div class="headline align-center">
                        Do you want to remove {{ potentiallyRemovableSource.title }}?
                    </div>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="red--text" flat @click.stop="deleteFinalDecided(true)">Yes</v-btn>
                    <v-btn class="green--text" flat @click.stop="deleteFinalDecided(false)">No</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showURLDialog">
            <v-card>
                <v-card-text style="padding-bottom: 0">
                    <v-text-field
                        label="Enter URL: "
                        required
                        type="email"
                        v-model="sourceUrl"
                        :rules="[rules.url]"
                    >
                    </v-text-field>
                </v-card-text>
                <v-card-actions style="padding-top: 0">
                    <v-spacer></v-spacer>
                    <v-btn
                        class="green--text"
                        flat
                        @click.stop="getNewFeedSource"
                        :loading="showURLLoading"
                        :disabled="showURLLoading"
                    >
                        <v-icon class="green--text">fa-paper-plane</v-icon>
                        <span style="padding: 0 7px">Send</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showSourceDialog">
            <v-card v-if="newSource">
                <v-card-title>
                    <v-layout row align-center>
                        <v-flex xs3 class="text-xs-center">
                            <img :src="newSource.favicon" :alt="newSource.title" style="height: 25px" />
                        </v-flex>
                        <v-flex xs9>
                            <v-container>
                                <div class="headline">
                                    {{ newSource.title }}
                                </div>
                            </v-container>
                        </v-flex>
                    </v-layout>
                </v-card-title>
                <v-card-text>
                    <div class="title grey--text" style="padding: 0 7px">
                        {{ newSource.description }}
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        class="green--text"
                        flat
                        @click.stop="saveNewFeedSource"
                    >
                        <v-icon class="green--text">fa-plus</v-icon>
                        <span style="padding: 0 7px">Add Source</span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <div class="masonry">
            <FeedSource
                v-for="source in sources"
                :feedSource="source"
                :deleteSource="deleteConfirmationSource"
                :key="source.hash"
            >
            </FeedSource>
        </div>
        <v-progress-circular
            indeterminate
            class="green--text"
            v-if="loading"
        >
        </v-progress-circular>
        <v-btn
            class="green"
            fab
            bottom
            right
            fixed
            @click.stop="showURLDialog = true"
        >
            <v-icon class="white--text">fa-plus</v-icon>
        </v-btn>
    </div>
</template>

<script>
    import {
        mapMutations
    } from 'vuex';

    import {
        getAllFeedSources,
        fetchFeedSource,
        saveFeedSource,
        deleteFeedSource
    } from './../api/api';
    import FeedSource from './sub-components/FeedSource.vue';
    import EmptyFeed from './sub-components/EmptyFeed.vue';

    export default {
        components: {
            FeedSource,
            EmptyFeed
        },
        data() {
            return {
                sources: [],
                potentiallyRemovableSource: {
                    hash: '',
                    title: ''
                },
                showConfirmationDialog: false,
                showURLDialog: false,
                showSourceDialog: false,
                showURLLoading: false,
                sourceUrl: '',
                newSource: null,
                regex: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
                rules: {
                    url: (value) => {
                        return this.regex.test(value) || 'Invalid URL';
                    }
                },
                loading: false
            };
        },
        watch: {
            '$route' () {
                this.getAllSources();
                this.sources = [];
            }
        },
        mounted() {
            this.getAllSources();
            this.sources = [];
        },
        methods: {
            ...mapMutations([
                'toggleLoader',
                'removeFeedSource',
                'addFeedSource'
            ]),
            getAllSources() {
                this.loading = true;
                getAllFeedSources()
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                let sources = data.feeds;
                                sources = sources.sort((first, second) => {
                                    if (first.title < second.title)
                                        return -1;
                                    else if (first.title === second.title)
                                        return 0;
                                    else
                                        return 1;
                                });

                                this.sources = sources;
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }
                        this.loading = false;
                    });
            },
            getNewFeedSource() {
                if (!this.regex.test(this.sourceUrl)) {
                    return;
                }

                this.showURLLoading = true;
                fetchFeedSource(this.sourceUrl)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.sourceUrl = '';
                                this.newSource = data.feed;
                                this.showSourceDialog = true;
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }

                        this.showURLDialog = false;
                        this.showURLLoading = false;
                    });
            },
            saveNewFeedSource() {
                saveFeedSource(this.newSource)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {

                                let currentFeeds = [...this.sources];
                                currentFeeds.push(data.feed);
                                currentFeeds = currentFeeds.sort((first, second) => {
                                    if (first.title < second.title)
                                        return -1;
                                    else if (first.title === second.title)
                                        return 0;
                                    else
                                        return 1;
                                });

                                this.sources = currentFeeds;
                                this.addFeedSource(data.feed);

                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }

                        this.newSource = null;
                        this.showSourceDialog = false;
                    });
            },
            deleteConfirmationSource(hash, title) {
                this.potentiallyRemovableSource.hash = hash;
                this.potentiallyRemovableSource.title = title;
                this.showConfirmationDialog = true;
            },
            deleteFinalDecided(value) {
                if (value) {
                    let hash = this.potentiallyRemovableSource.hash;
                    deleteFeedSource(hash)
                        .then(data => {
                            if (data.error === undefined) {
                                if (data.success) {
                                    this.removeFeedSource(hash);
                                    let sources = this.sources.filter(element => {
                                        return element.hash !== hash;
                                    });
                                    this.sources = sources;
                                    this.$emit('displayMessage', 'success', data.message);
                                } else {
                                    this.$emit('displayMessage', 'warning', data.message);
                                }
                            } else {
                                this.$emit('displayMessage', 'error', data.error);
                            }
                        });
                }
                this.potentiallyRemovableSource = {
                    hash: '',
                    title: ''
                };
                this.showConfirmationDialog = false;
            }
        }
    };
</script>
