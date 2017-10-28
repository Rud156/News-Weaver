<template>
    <v-flex xs12 sm6 md4 lg3 d-flex style="margin: 7px 0">
        <v-card raised class="flex-display">
            <v-card-media
                class="white--text image-zoom"
                height="200px"
                :src="item.image"
            >
                <v-container fill-height fluid>
                    <v-layout fill-height>
                        <v-flex xs12 align-end flexbox>
                            <span class="headline default-text-shadow">{{ item.title | decodeHTML }}</span>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-media>
            <v-card-title class="flex-content">
                <div class="truncated-text-display">
                    <span style="color: #5a5e66">{{ item.description | removeHTML | truncate }}</span>
                </div>
            </v-card-title>
            <v-card-actions class="flex-footer">
                <v-spacer></v-spacer>
                <div class="body-2" style="margin: 0 14px">{{ item.date | ago | titleCase }}</div>
            </v-card-actions>
            <v-card-actions class="flex-footer">
                <div :class="className">
                    <v-btn
                        class="blue--text"
                        flat
                        icon
                        @click.stop="viewNews(item, index)"
                    >
                        <v-icon class="blue--text">fa-eye</v-icon>
                    </v-btn>
                </div>
                <slot name="slot_1"></slot>
                <div :class="className">
                    <v-btn
                        class="deep-orange--text"
                        flat
                        icon
                        target="_blank"
                        :href="item.URL"
                        rel="noopener"
                    >
                        <v-icon class="deep-orange--text">fa-external-link</v-icon>
                    </v-btn>
                </div>
                <slot name="slot_2"></slot>
                <slot name="slot_3"></slot>
            </v-card-actions>
        </v-card>
    </v-flex>
</template>


<script>
    export default {
        props: {
            item: {
                type: Object,
                required: true
            },
            viewNews: {
                type: Function,
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            className: {
                type: String,
                required: true
            }
        }
    }
</script>
