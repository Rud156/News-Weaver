<template>
    <div style="width: 100%; min-height: 100%" id="mainDiv">
        <el-row :gutter="20" style="margin: 0">
            <el-col :span="24" style="margin-bottom: 21px">
                <h1>
                    <span id="logo-text" style="font-family: 'Signika', sans-serif; font-size: 45px">
                        News Weaver
                    </span>
                </h1>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-row :gutter="20" style="font-family: 'Signika', sans-serif; font-size: 40px">
                    <el-col :span="24" style="padding: 14px 0">
                        An RSS Reader for the Web
                    </el-col>
                    <el-col :span="24" style="padding: 14px 0">
                        Made using
                        <a href="https://expressjs.com" target="_blank" class="slide-line">
                            Express
                        </a> and
                        <a href="https://vuejs.org" target="_blank" class="slide-line">
                            VueJS
                        </a>
                    </el-col>
                    <el-col :span="24" style="padding: 14px 0">
                        <a href="https://www.github.com/rud156/news-weaver" target="_blank">
                            <el-button icon="search">
                                See On Github
                            </el-button>
                        </a>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-tabs>
                    <el-tab-pane label="Login">
                        <el-form label-width="120px" class="custom-padding">
                            <el-row style="margin: 14px 0">
                                <el-col :span="6">
                                    <div style="float: left; margin-top: 7px">Username:</div>
                                </el-col>
                                <el-col :span="18">
                                    <el-input v-model="user.username" required></el-input>
                                </el-col>
                            </el-row>
                            <el-row style="margin: 14px 0">
                                <el-col :span="6">
                                    <div style="float: left; margin-top: 7px">Password:</div>
                                </el-col>
                                <el-col :span="18">
                                    <el-input v-model="user.password" type="password" required></el-input>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="24">
                                    <el-button type="primary" @click="loginUser">
                                        Login
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="Register">
                        <el-form label-width="120px" class="custom-padding">
                            <el-row style="margin: 14px 0">
                                <el-col :span="6">
                                    <div style="float: left; margin-top: 7px">Username:</div>
                                </el-col>
                                <el-col :span="18">
                                    <el-input v-model="user.username" required></el-input>
                                </el-col>
                            </el-row>
                            <el-row style="margin: 14px 0">
                                <el-col :span="6">
                                    <div style="float: left; margin-top: 7px">Password:</div>
                                </el-col>
                                <el-col :span="18">
                                    <el-input v-model="user.password" type="password" required></el-input>
                                </el-col>
                            </el-row>
                            <el-row style="margin: 14px 0">
                                <el-col :span="6">
                                    <div style="float: left; margin-top: 7px">Re Password:</div>
                                </el-col>
                                <el-col :span="18">
                                    <el-input v-model="user.rePassword" type="password" required></el-input>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col>
                                    <el-button type="primary" @click="registerUser">
                                        Register
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
            <el-col>
                <h1 style="padding-top: 21px; font-family: 'Signika', sans-serif; font-size: 40px">
                    Keep all your news in a single place. Simple and easy to read.
                </h1>
            </el-col>
        </el-row>
    </div>
</template>


<script>
    import { mapMutations } from 'vuex';
    import { handleError, displayMessage, loginUser, registerUser } from './../api/api.js';

    export default {
        data() {
            return {
                user: {
                    username: '',
                    password: '',
                    rePassword: ''
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
            loginUser() {
                var username = this.user.username;
                var password = this.user.password;
                if (username.trim() === '' || password.trim === '') {
                    this.displayMessage('Fields cannot be blank');
                    return;
                }

                loginUser({ username: username, password: password })
                    .then((data) => {
                        if (data.success) {
                            this.setUser({ username: username, token: data.token });
                            this.$router.push({ path: 'dashboard/all/all_news' });
                        }
                        else
                            handleError(null, data.message);
                    });
            },
            registerUser() {
                var username = this.user.username;
                var password = this.user.password;
                var rePassword = this.user.rePassword;
                if (username.trim() === '' || password.trim() === '' || rePassword.trim() === '') {
                    this.displayMessage('Fields cannot be blank');
                    return;
                }

                registerUser({ username: username, password: password, rePassword: rePassword })
                    .then((data) => {
                        if (data.success)
                            displayMessage("User registration successful. Please login to continue...");
                        else
                            handleError(null, data.message);
                    });
            }
        }
    };

</script>


<style scoped>
    #mainDiv {
        background: url('./../assets/background_1.jpg');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: fixed;
        color: white;
    }

    #logo-text {
        border-bottom: 1px solid white;
        border-right: 1px solid white;
        position: relative;
        padding: 14px;
        display: inline-block;
    }

    #logo-text:after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 0 25px 25px;
        border-color: transparent transparent white transparent;
    }

    .slide-line {
        position: relative;
    }

    .slide-line:after {
        position: absolute;
        content: "";
        width: 0%;
        bottom: 0;
        left: 0;
        border-bottom: 2px dashed #fe4a49;
        transition-duration: 0.5s;
    }

    .slide-line:hover:after {
        width: 100%;
    }
</style>