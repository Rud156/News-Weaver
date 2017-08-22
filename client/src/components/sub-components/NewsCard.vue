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
            <div class="one-fourth">
                <v-btn 
                    class="orange--text"
                    flat
                    icon
                    @click.stop="addNewsAsFavourite(item, index)"
                >
                    <v-icon class="orange--text">
                        {{ item.favourite ? 'fa-heart' : 'fa-heart-o' }}
                    </v-icon>
                </v-btn>
            </div>
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
            <div class="one-fourth">
                <v-btn
                    class="pink--text"
                    flat
                    icon
                >
                    <v-icon class="pink--text">fa-book</v-icon>
                </v-btn>
            </div>
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
            addNewsAsFavourite: {
                type: Function
            },
            index: {
                type: Number,
                required: true
            }
        }
    }
</script>