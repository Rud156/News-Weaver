<template>
    <div style="width: 100%; min-height: 100%" id="mainDiv">
        <el-row :gutter="20" style="margin: 0">
            <el-col :span="24" style="margin-bottom: 21px">
                <h1>
                    <span id="logo-text" style="font-family: 'Playball', cursive; font-size: 45px">
                        News Weaver
                    </span>
                </h1>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-row :gutter="20" style="font-family: 'Playball', cursive; font-size: 40px">
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
                        <el-form label-width="120px" style="padding: 20px 50px">
                            <el-form-item label="Username:">
                                <el-input v-model="user.username" required></el-input>
                            </el-form-item>
                            <el-form-item label="Password:">
                                <el-input v-model="user.password" required></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="loginUser">
                                    Login
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="Register">
                        <el-form label-width="120px" style="padding: 20px 50px">
                            <el-form-item label="Username:">
                                <el-input v-model="user.username" required></el-input>
                            </el-form-item>
                            <el-form-item label="Password:">
                                <el-input v-model="user.password" required></el-input>
                            </el-form-item>
                            <el-form-item label="Re Password:">
                                <el-input v-model="user.rePassword" required></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="registerUser">
                                    Register
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
            <el-col>
                <h1 style="padding-top: 21px; font-family: 'Playball', cursive; font-size: 40px">
                    Keep all your news in a single place. Simple and easy to read.
                </h1>
            </el-col>
        </el-row>
    </div>
</template>


<script>
    import axios from 'axios';

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
        methods: {
            loginUser() {
                var username = this.user.username;
                var password = this.user.password;
                if (username.trim() === '' || password.trim === '') {
                    this.$store.commit('openModal', 'Fields cannot be blank');
                    return;
                }

                axios.post('http://localhost:3000/auth/login', {
                    username: username,
                    password: password
                })
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            this.$store.commit('setUser', {
                                username: username,
                                token: data.token
                            });
                            this.$router.push({ path: 'dashboard' });
                        }
                        else
                            this.displayMessage(data.message);
                    })
                    .catch((error) => {
                        this.handleError(error);
                    });
            },
            registerUser() {
                var username = this.user.username;
                var password = this.user.password;
                var rePassword = this.user.rePassword;
                if (username.trim() === '' || password.trim() === '' || rePassword.trim() === '') {
                    this.$store.commit('openModal', 'Fields cannot be blank');
                    return;
                }

                axios.post('http://localhost:3000/auth/register', {
                    username: username,
                    password: password,
                    rePassword: rePassword
                })
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success)
                            this.displayMessage("User registration successful. Please login to continue...");
                        else
                            this.displayMessage(data.message);


                    })
                    .catch((error) => {
                        this.handleError(error);
                    });
            },
            handleError(error) {
                console.log(error);
                this.$store.commit('openModal', 'Something went wrong. Please try again');
            },
            displayMessage(message) {
                this.$store.commit('openModal', message);
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