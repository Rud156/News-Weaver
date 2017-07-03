<template>
    <div style="width: 100%; min-height: 100%; font-size: 25px">
        <vodal :show="displayModal" @hide="closeModal" :height="95" animation="flip">
            <el-input placeholder="Enter the URL of the feed" v-model="feedURL" type="url" required></el-input>
            <el-button @click="submitURL" type="primary" icon="search" style="margin-top: 21px; float: right">Fetch URL</el-button>
        </vodal>
        <el-row :gutter="20" style="padding: 21px">
            <el-col :xs="24" :sm="12" :md="6" :lg="4" v-for="source in sources">px
                <el-card>
                    <div slot="header">
                        Hello World
                    </div>
                </el-card>
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

    export default {
        data() {
            return {
                sources: [],
                feedURL: '',
                displayModal: true
            };
        },
        methods: {
            ...mapGetters([
                'getToken'
            ]),
            ...mapMutations([
                'openModal'
            ]),
            closeModal() {
                this.displayModal = false;
                // TODO: Complete this function for clearing the form field etc.
            },
            getAllSources() {
                axios.get('http://localhost:3000/user/all_feed_sources')
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

            },
            handleError(error) {
                console.log(error);
                this.openModal('Something went wrong. Please try again');
            },
            displayMessage(message) {
                this.openModal(message);
            }
        }
    };

</script>