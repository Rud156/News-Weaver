<template>
    <v-flex xs12 sm6 md4 lg3 xl3 style="margin: 7px 0">
        <v-card raised :height="'413px'" class="flex-display">
            <v-card-media
                class="white--text image-zoom"
                height="200px"
                :src="item.image"
            >
                <v-container fill-height fluid>
                    <v-layout fill-height>
                        <v-flex xs12 align-end flexbox>
                            <span class="headline default-text-shadow">{{ item.title }}</span>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-media>
            <v-card-title class="flex-content">
                <div class="truncated-text-display">
                    <span style="color: #5a5e66">{{ item.summary | removeHTML | truncate }}</span>
                </div>
            </v-card-title>
            <v-card-actions class="flex-footer">
                <v-spacer></v-spacer>
                <div class="body-2" style="margin: 0 14px">{{ item.date | ago | titleCase }}</div>
            </v-card-actions>
            <v-card-actions class="flex-footer">
                <div class="one-fourth">
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
                <div class="one-fourth">
                    <v-btn
                        class="red--text"
                        flat
                        icon
                        target="_blank"
                        :href="item.URL"
                    >
                        <v-icon class="red--text">fa-external-link</v-icon>
                    </v-btn>
                </div>
                <slot name="slot_2"></slot>
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
            }
        }
    }
</script>
