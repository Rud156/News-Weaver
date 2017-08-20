<template>
    <div>
        <el-card v-if="readingList.length <= 0" style="max-width: 480px; margin: 0 auto">
            <div slot="header" class="clearfix" style="text-align: center">
                <icon name="bell-o" scale="5"></icon>
                <br />
                <span style="font-size: 25px">No News In Read Later Right Now...</span>
            </div>
        </el-card>
        <div v-else>
            <el-row :gutter="20" style="padding: 21px; margin: 0">
                <news-card v-for="news in readingList" :key="news.hash" :news="news"></news-card>
            </el-row>
        </div>
    </div>
</template>

<script>
    import {
        displayMessage,
        getReadingList,
        markAsRead,
        removeFromReadingList
    } from './../api/api';
    import newsCard from './sub-components/NewsCard.vue';

    export default {
        data() {
            return {
                readingList: [],
                showModal: false,
            };
        },
        components: {
            newsCard
        },
        watch: {
            '$route' () {
                this.fetchReadingList();
            }
        },
        mounted() {
            this.fetchReadingList();
        },
        methods: {
            fetchReadingList() {
                this.loading = true;
                getReadingList()
                    .then((data) => {
                        if (data.success)
                            this.readingList = data.news;
                        else
                            displayMessage(data.message);
                    });
            },
            markNewsAsRead(hash) {
                markAsRead(hash)
                    .then((data) => {
                        displayMessage(data.message);
                    });
            },
            deleteFromReadingList(hash) {
                removeFromReadingList(hash)
                    .then((data) => {
                        if (data.success)
                            this.readingList = this.readingList.filter((element) => {
                                return element.hash !== hash
                            });
                        displayMessage(data.message);
                    });
            }
        }
    };
</script>