<template>
    <div style="width: 100%; min-height: 100%">
        <vodal :show="showModal" animation="rotate" @hide="hideModal" style="font-family: 'Signika', sans-serif;" :height="270">
            <h4 style="margin: 7px 0">Edit Feed Details:</h4>
            <el-form v-if="editableNews" label-width="120px">
                <el-form-item label="Title">
                    <el-input v-model="editableNews.title"></el-input>
                </el-form-item>
                <el-form-item label="Image URL">
                    <el-input v-model="editableNews.image" type="url"></el-input>
                </el-form-item>
                <el-form-item label="Summary">
                    <el-input type="textarea" v-model="editableNews.description"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="saveEditedFavourite" icon="check" style="float: right">
                        Save
                    </el-button>
                </el-form-item>
            </el-form>
        </vodal>
        <el-card v-if="favourites.length <= 0" style="max-width: 480px; margin: 0 auto">
            <div slot="header" class="clearfix" style="text-align: center">
                <icon name="bell-o" scale="5"></icon>
                <br />
                <span style="font-size: 25px">No Favourites To Show Right Now...</span>
            </div>
        </el-card>
        <div v-else>
            <el-row :gutter="20" style="padding: 21px; margin: 0">
                <news-card v-for="fav in favourites" :key="fav.hash" :news="fav" :delete-news="deleteFavourite" :edit-news="editFavourite"></news-card>
            </el-row>
        </div>
    </div>
</template>

<script>
    import {
        displayMessage,
        getAllFavourites,
        deleteFavourite,
        saveEditedFavourite
    } from './../api/api.js';
    import newsCard from './sub-components/NewsCard.vue';

    export default {
        data() {
            return {
                favourites: [],
                showModal: false,
                editableNews: null
            };
        },
        components: {
            newsCard
        },
        mounted() {
            this.fetchAllFavourites();
        },
        methods: {
            fetchAllFavourites() {
                getAllFavourites()
                    .then((data) => {
                        if (data.success)
                            this.favourites = data.favourites;
                        else
                            displayMessage(data.message);
                    });
            },
            deleteFavourite(hash) {
                deleteFavourite(hash)
                    .then((data) => {
                        if (data.success) {
                            var updatedFavourites = this.favourites.filter((element) => {
                                if (element.hash !== hash)
                                    return element;
                            });
                            this.favourites = updatedFavourites;
                        }
                        displayMessage(data.message);
                    });
            },
            saveEditedFavourite() {
                var title = this.editableNews.title;
                var image = this.editableNews.image;
                var description = this.editableNews.description;
                var hash = this.editableNews.hash;

                saveEditedFavourite({ title: title, imageURL: image, description: description, hash: hash })
                    .then((data) => {
                        if (data.success) {
                            for (let i = 0; i < this.favourites.length; i++) {
                                if (this.favourites[i].hash === hash) {
                                    this.favourites[i].title = title;
                                    this.favourites[i].description = description;
                                    this.favourites[i].image = image;
                                    break;
                                }
                            }
                        }
                        displayMessage(data.message);
                        this.hideModal();
                    });
            },
            editFavourite(news) {
                this.editableNews = news;
                this.showModal = true;
            },
            hideModal() {
                this.editableNews = null;
                this.showModal = false;
            }
        }
    };

</script>