<template>
    <v-layout row justify-center>
        <v-dialog
            v-model="displayModal"
            fullscreen
            transition="dialog-bottom-transition"
            :overlay=false
        >
            <v-card>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn flat icon @click="closeNewsView" class="red--text">
                        <v-icon>fa-times</v-icon>
                    </v-btn>
                </v-card-actions>
                <v-card-title>
                    <v-container v-if="item.title !== undefined">
                        <div class="display-1">
                            {{ item.title | decodeHTML}}
                        </div>
                        <img
                            :src="item.image"
                            :alt="item.title"
                            class="image-view"
                        />
                        <div
                            class="title html-description-content"
                            v-html="filterIFrames(item.description)"
                        >
                        </div>
                    </v-container>
                </v-card-title>
                <!-- <v-bottom-nav value="true" class="white" :input-value="true" active>
                    <slot name="slot_1"></slot>
                    <v-btn
                        flat
                        target="_blank"
                        :href="item.URL"
                        :input-value="true"
                    >
                        <v-icon class="deep-orange--text">fa-external-link</v-icon>
                    </v-btn>
                    <slot name="slot_2"></slot>
                    <slot name="slot_3"></slot>
                </v-bottom-nav> -->
                <div class="white bottom-nav bottom-nav--active">
                    <slot name="slot_1"></slot>
                    <v-btn
                        flat
                        target="_blank"
                        :href="item.URL"
                        :input-value="true"
                    >
                        <v-icon class="deep-orange--text">fa-external-link</v-icon>
                    </v-btn>
                    <slot name="slot_2"></slot>
                    <slot name="slot_3"></slot>
                </div>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
    export default {
        props: {
            showModal: {
                type: Boolean,
                required: true
            },
            item: {
                type: Object,
                required: true
            },
            closeModal: {
                type: Function,
                required: true
            }
        },
        data() {
            return {
                displayModal: false
            };
        },
        watch: {
            showModal(updatedValue) {
                this.displayModal = updatedValue;
            }
        },
        methods: {
            closeNewsView() {
                this.displayModal = false;
                this.closeModal();
            },
            filterIFrames(htmlString) {
                var regex = /<iframe.*?\/iframe>/g;
                return htmlString.replace(regex, '');
            }
        }
    }
</script>
