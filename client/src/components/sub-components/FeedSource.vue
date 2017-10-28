<template>
    <v-card class="masonry-item" raised>
        <v-card-text>
            <v-layout row align-center>
                <v-flex xs3 class="text-xs-center">
                    <img :src="favicon" :alt="title" style="height: 25px" />
                </v-flex>
                <v-flex xs9>
                    <v-container>
                        <div class="headline" style="word-wrap: break-word">
                            {{ title }}
                        </div>
                    </v-container>
                </v-flex>
            </v-layout>
            <v-layout row>
                <v-flex xs12>
                    <div class="title grey--text" style="padding: 0 7px">
                        {{ description }}
                    </div>
                </v-flex>
            </v-layout>
        </v-card-text>
        <v-card-actions>
            <div class="one-third">
                <v-btn
                    class="blue--text"
                    flat
                    icon
                    :to="'/dashboard/all/' + hash"
                >
                    <v-icon class="blue--text">fa-eye</v-icon>
                </v-btn>
            </div>
            <div class="one-third">
                <v-btn
                    class="deep-orange--text"
                    flat
                    icon
                    target="_blank"
                    :href="siteURL"
                >
                    <v-icon class="deep-orange--text">fa-external-link</v-icon>
                </v-btn>
            </div>
            <div class="one-third">
                <v-btn
                    class="red--text"
                    flat
                    icon
                    @click.stop="deleteSource(hash, title)"
                >
                    <v-icon class="red--text">fa-trash-o</v-icon>
                </v-btn>
            </div>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        props: {
            feedSource: {
                type: Object,
                required: true
            },
            deleteSource: {
                type: Function,
                required: true
            }
        },
        data() {
            return {
                title: this.feedSource.title,
                description: this.feedSource.description,
                favicon: this.feedSource.favicon,
                feedURL: this.feedSource.feedURL,
                siteURL: this.feedSource.URL,
                hash: this.feedSource.hash
            };
        }
    };
</script>
