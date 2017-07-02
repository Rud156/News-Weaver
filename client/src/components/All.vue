<template>
    <div style="width: 100%; min-height: 100%; font-size: 25px">
        <el-card v-if="allNews.length <= 0" style="max-width: 480px; margin: 0 auto">
            <div slot="header" class="clearfix" style="text-align: center">
                <icon name="bell-o" scale="5"></icon>
                <br />
                <span style="font-size: 25px">No Feeds To Show Right Now...</span>
            </div>
        </el-card>
        <div v-else>
            <!-- TODO: Implement the else part to show the feeds -->
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import { mapGetters, mapMutations } from 'vuex';

    export default {
        data() {
            return {
                allNews: []
            };
        },
        mounted() {
            this.loadAllFeeds();
        },
        methods: {
            ...mapGetters([
                'getToken'
            ]),
            ...mapMutations([
                'openModal'
            ]),
            loadAllFeeds() {
                var token = this.getToken();
                axios.get('http://localhost:3000/user/all_feed_news?token=' + token)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success)
                            this.allNews = data.news;
                        else
                            this.displayMessage(data.message);
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
        }
    };

</script>