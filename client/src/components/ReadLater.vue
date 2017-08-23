<template>
    <div>
        
    </div>
</template>

<script>
    import {
        getReadingList,
        markAsRead,
        removeFromReadingList
    } from './../api/api';
    import NewsCard from './sub-components/NewsCard.vue';

    export default {
        data() {
            return {
                readingList: [],
                showModal: false,
            };
        },
        components: {
            NewsCard
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