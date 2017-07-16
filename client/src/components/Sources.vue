<template>
    <div style="width: 100%; min-height: 100%;">
        <source-popup :displayModal="displayModal" :closeModal="closeModal" :saveFeed="saveFeed" :submitURL="submitURL" :feedObject="feedObject"
            :height="height"></source-popup>
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
    import axios from 'axios';
    import { mapGetters, mapMutations } from 'vuex';
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
            ...mapGetters([
                'getToken',
                'getBaseURL'
            ]),
            ...mapMutations([
                'toggleLoader'
            ]),
            closeModal() {
                this.displayModal = false;
                this.feedObject = null;
                this.height = 95;
            },
            getAllSources() {
                axios.get(`${this.getBaseURL()}/user/all_feed_sources?token=${this.getToken()}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            this.sources = data.feeds;
                        }
                        else
                            this.displayMessage(data.message);
                    })
                    .catch((error) => {
                        this.handleError(error);
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

                    axios.get(`${this.getBaseURL()}/user/get_feed?url=${URL}&token=${this.getToken()}`)
                        .then((response) => {
                            return response.data;
                        })
                        .then((data) => {
                            this.displayModal = true;
                            this.toggleLoader();

                            if (data.success) {
                                this.feedObject = data.feedDetails;
                                this.height = 270;
                            }
                            else {
                                this.closeModal();
                                this.displayMessage(data.message);
                            }
                        })
                        .catch((error) => {
                            this.handleError(error);
                        });
                }
            },
            saveFeed() {
                if (!this.feedObject.description)
                    this.feedObject.description = this.feedObject.title;
                var feed = {
                    title: this.feedObject.title,
                    description: this.feedObject.description,
                    siteURL: this.feedObject.siteURL,
                    feedURL: this.feedObject.feedURL,
                    favicon: this.feedObject.favicon
                };

                this.closeModal();
                axios.post(`${this.getBaseURL()}/user/save_feed?token=${this.getToken()}`, feed)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            this.sources.push(data.feed);
                        }
                        else {
                            this.displayMessage(data.message);
                        }
                    })
                    .catch((error) => {
                        this.handleError(error);
                    });

            },
            viewFeed(feed) {
                var hash = feed.hash;
                this.$router.push({ path: `/dashboard/all/${hash}` });
            },
            deleteFeed(feed) {
                var hash = feed.hash;
                axios.delete(`${this.getBaseURL()}/user/delete_feed?token=${this.getToken()}&hash=${hash}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            var changedScource = this.sources.filter((source) => {
                                if (source.hash !== hash)
                                    return source;
                            });
                            this.sources = changedScource;
                        }
                        else
                            this.displayMessage(data.message);
                    })
                    .catch((error) => {
                        this.handleError(error);
                    });
            },
            handleError(error) {
                if (error.response.status === 403) {
                    this.$emit('validation-failed', 'logout');
                    this.$notify({
                        type: 'warning',
                        title: 'Warning',
                        message: 'Please login again'
                    });
                    return;
                }
                console.log(error);
                this.$notify({
                    type: 'error',
                    title: 'Error',
                    message: 'Something went wrong. Please try again'
                });
            },
            displayMessage(message) {
                this.$notify({
                    type: 'info',
                    title: 'Info',
                    message: message
                });
            }
        }
    };

</script>