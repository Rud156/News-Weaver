<template>
    <div style="width: 100%; min-height: 100%">
        <el-card v-if="favourites.length <= 0" style="max-width: 480px; margin: 0 auto">
            <div slot="header" class="clearfix" style="text-align: center">
                <icon name="bell-o" scale="5"></icon>
                <br />
                <span style="font-size: 25px">No Favourites To Show Right Now...</span>
            </div>
        </el-card>
        <div v-else>
            <el-row :gutter="20" style="padding: 21px; margin: 0">
                <news-card v-for="fav in favourites" :key="fav.hash" :news="fav" :delete-news="deleteFavourite"></news-card>
            </el-row>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import { mapGetters, mapMutations } from 'vuex';
    import newsCard from './sub-components/NewsCard.vue';

    export default {
        data() {
            return {
                favourites: []
            };
        },
        components: {
            newsCard
        },
        mounted() {
            this.fetchAllFavourites();
        },
        methods: {
            ...mapGetters([
                'getToken'
            ]),
            ...mapMutations([
                'openModal'
            ]),
            fetchAllFavourites() {
                axios.get(`http://localhost:3000/user/favourites?token=${this.getToken()}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success)
                            this.favourites = data.favourites;
                        else
                            this.displayMessage(data.message);
                    })
                    .catch((error) => {
                        this.handleError(error);
                    });
            },
            deleteFavourite(hash) {
                axios.delete(`http://localhost:3000/user/delete_favourite?token=${this.getToken()}&hash=${hash}`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            var updatedFavourites = this.favourites.filter((element) => {
                                if (element.hash !== hash)
                                    return element;
                            });
                            this.favourites = updatedFavourites;
                        }
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