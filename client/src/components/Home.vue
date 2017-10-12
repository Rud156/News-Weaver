<template>
    <div class="main-background" :style="styleObject">
        <v-snackbar
            :timeout="3000"
            :top="true"
            :right="true"
            v-model="displaySnackBar"
            :color="snackBarType"
        >
        {{ snackBarMessage }}
        <v-btn flat class="white--text" @click="displaySnackBar = false">Close</v-btn>
        </v-snackbar>
        <div style="padding-bottom: 7vh">
            <div class="display-1" style="padding: 7px">
                NEWS
                <a
                    href="https://www.github.com/Rud156/News-Weaver"
                    target="_blank"
                    class="red--text slide-line"
                    rel="noopener"
                >
                    WEAVER
                </a>
            </div>
            <div class="title">One stop shop for all your news</div>
        </div>
        <v-layout>
            <v-flex xs12 sm6 offset-sm3>
                <v-card class="elevation-12" style="margin: 0 14px">
                    <v-card-media
                        src="/static/360.jpg"
                        alt="Header"
                        height="200px"
                        class="white--text"
                    >
                        <v-container fill-height fluid>
                            <v-layout fill-height>
                                <v-flex xs12 align-end flexbox>
                                    <span class="headline" v-if="showLogin">Sign in to continue</span>
                                    <span class="headline" v-else>Sign up to register</span>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-media>
                    <v-card-title class="white">
                        <v-flex xs12>
                            <v-text-field
                                name="username"
                                label="Enter Username: "
                                v-model="user.username"
                                :counter="20"
                                :rules="[rules.required, rules.username]"
                                required
                            >
                            </v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                name="password"
                                label="Enter Password: "
                                v-model="user.password"
                                type="password"
                                hint="At least 5 characters"
                                min="5"
                                :counter="20"
                                required
                                :rules="[rules.required, rules.password]"
                            >
                            </v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                v-if="!showLogin"
                                name="rePass"
                                label="Re Enter Password: "
                                v-model="user.rePassword"
                                type="password"
                                hint="At least 5 characters"
                                min="5"
                                :counter="20"
                                required
                                :rules="[rules.required, rules.password]"
                            >
                            </v-text-field>
                        </v-flex>
                        <v-flex xs12 v-if="showLogin">
                            <v-btn
                                class="red darken-3 white--text"
                                style="float: right"
                                @click="handleUserLogin"
                                :loading="loading"
                                :disabled="loading"
                            >
                                <v-icon>fa-paper-plane</v-icon>
                                <span style="padding: 0 7px">Sign In</span>
                            </v-btn>
                            <span
                                class="subheading prompt-main-text"
                                @click="setRenderState"
                            >
                                Not yet registered?
                            </span>
                        </v-flex>
                        <v-flex xs12 v-else>
                            <v-btn
                                class="red darken-3 white--text"
                                style="float: right"
                                @click="handleUserRegistration"
                                :loading="loading"
                                :disabled="loading"
                            >
                                <v-icon>fa-paper-plane</v-icon>
                                <span style="padding: 0 7px">Sign Up</span>
                            </v-btn>
                            <span
                                class="subheading prompt-main-text"
                                @click="setRenderState"
                            >
                                Already registered?
                            </span>
                        </v-flex>
                    </v-card-title>
                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>


<script>
    import {
        mapMutations
    } from 'vuex';
    import {
        loginUser,
        registerUser
    } from './../api/api';

    import {
        usernameRegex,
        passwordRegex
    } from './../utils/utility';

    export default {
        data() {
            return {
                user: {
                    username: '',
                    password: '',
                    rePassword: ''
                },
                showLogin: true,
                styleObject: {
                    paddingBottom: '42px'
                },
                snackBarMessage: '',
                displaySnackBar: false,
                snackBarType: 'info',
                loading: false,

                rules: {
                    required: (value) => !!value || 'Required.',
                    username: (value) => {
                        return usernameRegex.test(value) || 'Invalid Username';
                    },
                    password: (value) => {
                        return passwordRegex.test(value) || 'Invalid Password';
                    }
                }
            };
        },
        mounted() {
            window.document.title = 'News Weaver';
        },
        methods: {
            ...mapMutations([
                'setUser'
            ]),
            setRenderState() {
                if (this.showLogin) {
                    this.showLogin = false;
                    this.styleObject.paddingBottom = '42px';
                } else {
                    this.showLogin = true;
                    this.styleObject.paddingBottom = '42px';
                }
            },
            validateAllFields() {
                if (this.showLogin) {
                    if (!usernameRegex.test(this.user.username) ||
                        !passwordRegex.test(this.user.password))
                        return false;
                    else
                        return true;
                } else {
                    if (!usernameRegex.test(this.user.username) ||
                        !passwordRegex.test(this.user.password) ||
                        !passwordRegex.test(this.user.rePassword))
                        return false;
                    else
                        return true;
                }
            },
            displayMessage(messageType, message) {
                this.snackBarType = messageType;
                this.displaySnackBar = true;
                this.snackBarMessage = message;
            },
            handleUserLogin() {
                let username = this.user.username;
                let password = this.user.password;

                if (!this.validateAllFields()) {
                    this.displayMessage('warning', 'Invalid Fields Format Entered');
                    return;
                }

                this.loading = true;
                loginUser({
                        username: username,
                        password: password
                    })
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.setUser({
                                    username: username,
                                    token: data.token
                                });
                                this.$router.push({
                                    path: 'dashboard/all/all_news'
                                });
                            } else {
                                this.displayMessage('error', data.message);
                            }
                        } else {
                            this.displayMessage('error', data.error);
                        }
                        this.loading = false;
                    });

            },
            handleUserRegistration() {
                let username = this.user.username;
                let password = this.user.password;
                let rePassword = this.user.rePassword;

                if (!this.validateAllFields()) {
                    this.displayMessage('warning', 'Invalid Fields Format Entered');
                    return;
                }

                this.loading = true;
                registerUser({
                        username: username,
                        password: password,
                        rePassword: rePassword
                    })
                    .then(data => {
                        if (data.error === undefined) {
                            if (data.success) {
                                this.displayMessage('success', data.message);
                            } else {
                                this.displayMessage('info', data.message);
                            }
                        } else {
                            this.displayMessage('error', data.error);
                        }

                        this.loading = false;
                    });
            }
        }
    };
</script>
