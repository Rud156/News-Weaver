<template>
    <div>
        <v-snackbar
            :timeout="3000"
            :top="true"
            :right="true"
            :color="snackBarType"
            v-model="displaySnackBar"
        >
            {{ snackBarMessage }}
            <v-btn flat class="white--text" @click="displaySnackBar = false">Close</v-btn>
        </v-snackbar>
        <v-app
            height="415px"
            standalone
        >
            <v-navigation-drawer
                class="grey lighten-4 pb-0"
                height="100%"
                clipped
                temporary
                v-model="showDrawer"
            >
                <v-list dense>
                    <v-list-tile
                        :to="'/dashboard/all/all_news'"
                    >
                        <v-list-tile-action>
                            <v-icon>fa-newspaper-o</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                All News
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile
                        v-for="item in navigations"
                        :key="item.name"
                        :to="'/dashboard/' + item.nav"
                    >
                        <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ item.name }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-divider></v-divider>
                    <v-subheader class="mt-3 black--text text--darken-1">SUBSCRIPTIONS</v-subheader>
                    <v-list>
                        <v-list-tile
                            v-for="item in getFeedSources()"
                            :key="item.hash"
                            :to="'/dashboard/all/' + item.hash"
                            avatar
                        >
                          <v-list-tile-avatar>
                            <img :src="item.favicon" :alt="item.title">
                          </v-list-tile-avatar>
                          <v-list-tile-title v-text="item.title"></v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-list>
            </v-navigation-drawer>
            <v-toolbar
                :fixed="true"
            >
                <v-toolbar-title class="white--text">
                    <v-btn icon @click.stop="showDrawer = !showDrawer">
                        <v-icon>fa-bars</v-icon>
                    </v-btn>
                    <span class="hidden-sm-and-down">
                        <span class="black--text">NEWS</span>
                        <span class="red--text slide-line">WEAVER</span>
                    </span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn flat :input-value="true" @click="handleSelect('dashboard')">
                        Dashboard
                    </v-btn>
                    <v-btn flat @click="handleSelect('logout')">
                        Logout
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <main style="margin-top: 56px">
                <v-container>
                    <v-layout>
                    <v-flex xs12>
                        <transition name="slide-x-reverse-transition">
                            <router-view @displayMessage="displayMessage">
                            </router-view>
                        </transition>
                    </v-flex>
                    </v-layout>
                </v-container>
            </main>
        </v-app>
    </div>
</template>


<script>
    import {
        mapMutations,
        mapGetters
    } from 'vuex';

    import {
        getAllFeedSources
    } from './../api/api';

    export default {
        data() {
            return {
                navigation: ['sources', 'favourites'],
                displayCaret: false,
                showDrawer: false,
                navigations: [{
                        name: 'Sources',
                        icon: 'fa-cog',
                        nav: 'sources'
                    },
                    {
                        name: 'Favourites',
                        icon: 'fa-star',
                        nav: 'favourites'
                    },
                    {
                        name: 'Read Later',
                        icon: 'fa-book',
                        nav: 'read_later'
                    }
                ],
                snackBarMessage: '',
                snackBarType: '',
                displaySnackBar: false
            };
        },
        mounted() {
            window.document.title = `${this.formatUsername()}'s Dashboard`;
            this.fetchFeedSources();
        },
        methods: {
            ...mapMutations([
                'removeUser',
                'setFeedSources'
            ]),
            ...mapGetters([
                'formatUsername',
                'getFeedSources'
            ]),
            handleSelect(key) {
                switch (key) {
                    case 'logout':
                        this.removeUser();
                        this.$router.push({
                            path: '/'
                        });
                        break;
                    default:
                        this.$router.push({
                            path: '/dashboard/all/all_news'
                        });
                        break;
                }
            },
            displayMessage(messageType, message) {
                this.snackBarType = messageType;
                this.displaySnackBar = true;
                this.snackBarMessage = message;
            },
            fetchFeedSources() {
                getAllFeedSources()
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                let sources = data.feeds;
                                sources = sources.sort((first, second) => {
                                    if (first.title < second.title)
                                        return -1;
                                    else if (first.title === second.title)
                                        return 0;
                                    else
                                        return 1;
                                });
                                this.setFeedSources(sources);
                            } else {
                                this.displayMessage('warning', data.message);
                            }
                        } else {
                            this.displayMessage('error', data.error);
                        }
                    });
            }
        }
    };
</script>
