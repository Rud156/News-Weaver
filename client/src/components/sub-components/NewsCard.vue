<template>
    <v-card class="masonry-item" raised>
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
        <v-card-title>
            <div>
                <span style="color: #5a5e66">{{ item.summary | truncate | removeHTML }}</span>
            </div>
        </v-card-title>
        <v-card-actions>
            <v-spacer></v-spacer>
            <div class="subheading">{{ item.date | ago | titleCase }}</div>
        </v-card-actions>
        <v-card-actions>
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
            <slot name="favourite"></slot>
            <slot name="delete"></slot>
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
            <slot name="readLater"></slot>
            <slot name="edit"></slot>
        </v-card-actions>
    </v-card>
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