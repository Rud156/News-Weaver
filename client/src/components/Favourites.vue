<template>
    <div>

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
    import NewsCard from './sub-components/NewsCard.vue';

    export default {
        data() {
            return {
                favourites: [],
                showModal: false,
                editableNews: null
            };
        },
        components: {
            NewsCard
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
            fetchFavourites() {}
        }
    };
</script>