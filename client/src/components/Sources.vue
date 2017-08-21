<template>
    <div>
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
                <v-card-text class="py-0">
                    <v-text-field 
                        label="Enter URL: " 
                        required 
                        type="email"
                        v-model="sourceUrl"
                    >
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
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

        <v-dialog v-model="showSourceDialog" scrollable>
            <v-card v-if="newSource">
                <v-card-text>
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
                    <v-layout row>
                        <v-flex xs12>
                            <div class="title grey--text" style="padding: 0 7px">
                                {{ newSource.description }}
                            </div>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="green--text" flat @click.stop="saveNewFeedSource">Add Source</v-btn>
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

    export default {
        components: {
            FeedSource
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
                newSource: null
            };
        },
        mounted() {
            this.getAllSources();
        },
        methods: {
            ...mapMutations([
                'toggleLoader',
                'removeFeedSources',
                'addFeedSource'
            ]),
            getAllSources() {
                getAllFeedSources()
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.sources = data.feeds;
                            } else {
                                this.$emit('displayMessage', 'warning', data.message);
                            }
                        } else {
                            this.$emit('displayMessage', 'error', data.error);
                        }
                    });
            },
            getNewFeedSource() {
                this.showURLLoading = true;
                fetchFeedSource(this.sourceUrl)
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.sourceUrl = '';
                                this.newSource = data.feedDetails;
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
                                this.sources.push(data.feed);
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
                                    this.removeFeedSources(hash);
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