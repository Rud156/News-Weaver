<template>
    <div style="width: 100%; min-height: 100%;">
        <vodal :show="displayModal" @hide="closeModal" :height="height" animation="flip">
            <el-input placeholder="Enter the URL of the feed" v-model="feedURL" type="url"></el-input>
            <el-button @click="submitURL" type="primary" icon="search" style="margin-top: 21px;">Fetch URL</el-button>
            <div v-if="feedObject">
                <el-row style="padding: 21px">
                    <el-col :span="24">
                        <hr />
                    </el-col>
                    <el-col :span="12">
                        <img height="25" :src="feedObject.favicon" :alt="feedObject.title" />
                    </el-col>
                    <el-col :span="12">
                        <h6 style="font-weight: bolder; margin: 3px">{{feedObject.title}}</h6>
                    </el-col>
                    <el-col :span="24" style="padding: 7px">
                        {{feedObject.description}}
                    </el-col>
                    <el-col :span="24">
                        <el-input placeholder="Enter the category..." v-model="category"></el-input>
                        <el-button @click="saveFeed" type="primary" icon="star-on" style="margin-top: 21px;">Save Feed</el-button>
                    </el-col>
                </el-row>
            </div>
        </vodal>
        <el-row :gutter="20" style="padding: 21px">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" v-for="source in sources" :key="source.hash">
                <feed :feed="source"></feed>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="4">
                <el-card>
                    <div slot="header">
                        <span>Add A New Feed Source</span>
                    </div>
                    <div class="bottom clearfix">
                        <el-button type="success" icon="plus" @click="displayModal = true">Add Source</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import axios from 'axios';
    import { mapGetters, mapMutations } from 'vuex';
    import Feed from './sub-components/Feed.vue';

    export default {
        data() {
            return {
                sources: [],
                feedURL: '',
                height: 95,
                displayModal: false,
                feedObject: null,
                category: ''
            };
        },
        mounted() {
            this.getAllSources();
        },
        methods: {
            ...mapGetters([
                'getToken'
            ]),
            ...mapMutations([
                'openModal',
                'toggleLoader'
            ]),
            closeModal() {
                this.displayModal = false;
                this.feedURL = '';
                this.category = '';
                this.feedObject = null;
                this.height = 95;
            },
            getAllSources() {
                axios.get(`http://localhost:3000/user/all_feed_sources?token=${this.getToken()}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            console.log(data.feeds);
                            this.sources = data.feeds;
                        }
                        else
                            this.displayMessage(data.message);
                    })
                    .catch((error) => {
                        this.handleError(error);
                    });
            },
            submitURL() {
                var URL = this.feedURL;
                if (URL.trim() === '') {
                    this.displayModal = false;
                    this.displayMessage('Invalid empty URL');
                    return;
                }
                else {
                    this.toggleLoader();
                    this.closeModal();

                    axios.get(`http://localhost:3000/user/get_feed?url=${URL}&token=${this.getToken()}`)
                        .then((response) => {
                            return response.data;
                        })
                        .then((data) => {
                            this.displayModal = true;
                            this.toggleLoader();

                            if (data.success) {
                                this.feedObject = data.feedDetails;
                                this.height = 300;
                            }
                            else {
                                this.displayMessage(data.message);
                            }
                        })
                        .catch((error) => {
                            this.handleError(error);
                        });
                }
            },
            saveFeed() {
                var category = this.category;
                if (category.trim() === '') {
                    this.displayModal = false;
                    this.displayMessage('Please enter a category');
                    return;
                }
                var feed = {
                    title: this.feedObject.title,
                    description: this.feedObject.description,
                    siteURL: this.feedObject.siteURL,
                    feedURL: this.feedObject.feedURL,
                    category: this.category,
                    favicon: this.feedObject.favicon
                };

                this.closeModal();
                axios.post(`http://localhost:3000/user/save_feed?token=${this.getToken()}`, feed)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            console.log(data.feed);
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
            handleError(error) {
                console.log(error);
                this.openModal('Something went wrong. Please try again');
            },
            displayMessage(message) {
                this.openModal(message);
            }
        },
        components: {
            Feed
        }
    };

</script>