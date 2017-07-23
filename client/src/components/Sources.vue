<template>
    <div style="width: 100%; min-height: 100%;">
        <source-popup :displayModal="displayModal" :closeModal="closeModal" :saveFeedSource="saveFeedSource" :submitURL="submitURL"
            :feedObject="feedObject" :height="height"></source-popup>
        <el-row :gutter="20" style="padding: 21px; margin: 0">
            <div class="masonry">
                <el-card class="masonry-item">
                    <div slot="header">
                        <span>Add A New Feed Source</span>
                    </div>
                    <div class="bottom clearfix">
                        <el-button type="success" icon="plus" @click="displayModal = true">Add Source</el-button>
                    </div>
                </el-card>

                <feed class="masonry-item" :feed="source" :deleteFeed="deleteFeed" :viewFeed="viewFeed" v-for="source in sources" :key="source.hash"></feed>
            </div>
        </el-row>
    </div>
</template>

<script>
    import { mapMutations } from 'vuex';

    import {
        displayMessage,
        getAllFeedSources,
        fetchFeedSource,
        saveFeedSource,
        deleteFeedSource
    } from './../api/api.js';
    import Feed from './sub-components/Feed.vue';
    import SourcePopup from './sub-components/SourcePopup.vue';

    export default {
        components: {
            Feed,
            SourcePopup
        },
        data() {
            return {
                sources: [],
                height: 95,
                displayModal: false,
                feedObject: null
            };
        },
        mounted() {
            this.getAllSources();
        },
        methods: {
            ...mapMutations([
                'toggleLoader'
            ]),
            closeModal() {
                this.displayModal = false;
                this.feedObject = null;
                this.height = 95;
            },
            getAllSources() {
                getAllFeedSources()
                    .then((data) => {
                        if (data.success) {
                            this.sources = data.feeds;
                        }
                        else
                            displayMessage(data.message);
                    });
            },
            submitURL(feedURL) {
                var URL = feedURL;
                if (URL.trim() === '') {
                    this.displayModal = false;
                    this.displayMessage('Invalid empty URL');
                    return;
                }
                else {
                    this.toggleLoader();
                    this.closeModal();

                    fetchFeedSource(URL)
                        .then((data) => {
                            this.displayModal = true;
                            this.toggleLoader();

                            if (data.success) {
                                this.feedObject = data.feedDetails;
                                this.height = 270;
                            }
                            else {
                                this.closeModal();
                                displayMessage(data.message);
                            }
                        });
                }
            },
            saveFeedSource() {
                if (!this.feedObject.description)
                    this.feedObject.description = this.feedObject.title;
                var feedSource = {
                    title: this.feedObject.title,
                    description: this.feedObject.description,
                    siteURL: this.feedObject.siteURL,
                    feedURL: this.feedObject.feedURL,
                    favicon: this.feedObject.favicon
                };

                this.closeModal();
                saveFeedSource(feedSource)
                    .then((data) => {
                        if (data.success) {
                            this.sources.push(data.feed);
                        }
                        displayMessage(data.message);
                    });
            },
            viewFeed(feed) {
                var hash = feed.hash;
                this.$router.push({ path: `/dashboard/all/${hash}` });
            },
            deleteFeed(feed) {
                var hash = feed.hash;
                deleteFeedSource(hash)
                    .then((data) => {
                        if (data.success) {
                            var changedScource = this.sources.filter((source) => {
                                if (source.hash !== hash)
                                    return source;
                            });
                            this.sources = changedScource;
                        }
                        displayMessage(data.message);
                    });
            }
        }
    };

</script>