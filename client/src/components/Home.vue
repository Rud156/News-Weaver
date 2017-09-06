<template>
    <div class="main-background" :style="styleObject">
        <v-snackbar
            :timeout="3000"
            :top="true"
            :right="true"
            :success="snackBarType === 'success'"
            :info="snackBarType === 'info'"
            :warning="snackBarType === 'warning'"
            :error="snackBarType === 'error'"
            v-model="displaySnackBar"
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
            <v-flex xs12 sm4 offset-sm4>
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
                                hint="At least 8 characters"
                                min="8"
                                counter
                                required
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
                                hint="At least 8 characters"
                                min="8"
                                counter
                                required
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
                usernameRegex: /^[a-zA-Z0-9]+$/
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
            displayMessage(messageType, message) {
                this.snackBarType = messageType;
                this.displaySnackBar = true;
                this.snackBarMessage = message;
            },
            handleUserLogin() {
                let username = this.user.username;
                let password = this.user.password;

                if (username.trim() === '' || password.trim() === '') {
                    this.displayMessage('warning', 'Fields cannot ne blank');
                    return;
                }
                if (password.length < 8 || password.length > 25) {
                    this.displayMessage('error', 'Password must be between 8 and 25 characters long');
                    return;
                }
                if (!this.usernameRegex.test(username)) {
                    this.displayMessage('warning', 'Usernames can contain only a-z, A-Z, 0-9');
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

                if (username.trim() === '' || password.trim() === '' || rePassword.trim() === '') {
                    this.displayMessage('warning', 'Fields cannot be blank');
                    return;
                }
                if (password.length < 8 || password.length > 25 ||
                    rePassword.length < 8 || rePassword.length > 25) {
                    this.displayMessage('error', 'Password must be between 8 and 25 characters long');
                    return;
                }
                if (password !== rePassword) {
                    this.displayMessage('error', 'Passwords do not match');
                    return;
                }
                if (!this.usernameRegex.test(username)) {
                    this.displayMessage('warning', 'Usernames can contain only a-z, A-Z, 0-9');
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
