<template>
    <v-layout row justify-center style="position: relative;">
        <v-dialog
            v-model="displayModal"
            transition="scale-transition"
            persistent
            max-width="550px"
        >
            <v-card>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn flat icon @click="closeEditView" class="red--text">
                        <v-icon>fa-times</v-icon>
                    </v-btn>
                </v-card-actions>
                <v-card-text v-if="copyEditNews.title !== undefined">
                    <v-container fluid>
                        <v-layout row>
                            <v-flex xs12>
                                <v-text-field
                                    name="title"
                                    label="Title: "
                                    v-model="copyEditNews.title"
                                    required
                                >
                                </v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-layout row>
                            <v-flex xs12>
                                <v-text-field
                                    name="image"
                                    label="Image: "
                                    v-model="copyEditNews.image"
                                    required
                                >
                                </v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-layout row>
                            <v-flex xs12>
                                <v-text-field
                                    name="description"
                                    label="Description: "
                                    v-model="copyEditNews.description"
                                    multi-line
                                >
                                </v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions style="overflow-x: hidden">
                    <v-spacer></v-spacer>
                    <v-btn
                        flat
                        class="green darken-2 white--text"
                        @click.stop="saveEditedNews(copyEditNews, index)"
                    >
                        <span style="padding: 0 7px">Save</span>
                        <v-icon class="white--text">fa-floppy-o</v-icon>
                    </v-btn>
                    <v-btn
                        flat
                        class="red darken-2 white--text"
                        @click.stop="closeEditView"
                    >
                        <span style="padding: 0 7px">Close</span>
                        <v-icon class="white--text">fa-ban</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
    export default {
        props: {
            editableNews: {
                type: Object,
                required: true
            },
            closeModal: {
                type: Function,
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            showModal: {
                type: Boolean,
                required: true
            },
            saveEditedNews: {
                type: Function,
                required: true
            }
        },
        data() {
            return {
                displayModal: false,
                copyEditNews: Object.assign({}, this.editableNews)
            };
        },
        watch: {
            showModal(updatedValue) {
                this.displayModal = updatedValue;
            },
            editableNews(updatedNews) {
                this.copyEditNews = updatedNews;
            }
        },
        methods: {
            closeEditView() {
                this.displayModal = false;
                this.closeModal();
            }
        }
    }
</script>
