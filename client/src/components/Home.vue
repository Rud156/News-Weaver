<template>
    <el-row :gutter="20" id="block">
        <vodal :show="showModal" animation="flip" @hide="showModal = false" :width="width" :height="height">
            <el-tabs>
                <el-tab-pane label="Login">
                    <el-row>
                        <el-col :span="12">
                            <form>
                                <input type="text" class="input" v-model="user.username" placeholder="Username" />
                                <input type="password" class="input" v-model="user.password" placeholder="Password" />
                                <el-button size="large" style="margin-top: 14px">
                                    Login
                                </el-button>
                            </form>
                        </el-col>
                        <el-col :span="12">
                            <h2 style="text-align: center; margin-top: 55px">
                                Login Here
                            </h2>
                        </el-col>
                    </el-row>
                </el-tab-pane>
                <el-tab-pane label="Register">
                    <el-row>
                        <el-col :span="12">
                            <form>
                                <input type="text" class="input" v-model="user.username" placeholder="Username" />
                                <input type="password" class="input" v-model="user.password" placeholder="Password" />
                                <input type="password" class="input" v-model="user.rePassword" placeholder="Re Password" />
                                <el-button size="large">
                                    Register
                                </el-button>
                            </form>
                        </el-col>
                        <el-col :span="12">
                            <h2 style="text-align: center; margin-top: 85px">
                                Register Here
                            </h2>
                        </el-col>
                    </el-row>
                </el-tab-pane>
            </el-tabs>
        </vodal>
        <el-col :span="24" style="font-family: 'Playball', cursive;">
            <h1 style="text-align: center; font-size: 40px; font-weight: bolder">
                <span style="display: inline-block; padding: 20px;" id="logo-text">
                    New Weaver
                </span>
            </h1>
        </el-col>
        <el-col :span="24" style="font-family: 'Playball', cursive;">
            <div style="font-size: 45px; font-weight: bolder; text-align: right; padding: 20px">
                An RSS Reader for the web.
            </div>
        </el-col>
        <el-col :span="24" style="font-family: 'Playball', cursive;">
            <div style="font-size: 45px; font-weight: bolder; text-align: left; padding: 20px">
                Made using
                <a href="https://expressjs.com/" target="_blank" class="slide-line">
                    Express
                </a> and
                <a href="https://vuejs.org/" target="_blank" class="slide-line">
                    VueJS
                </a>
            </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <div style="margin-top: 10%">
                <el-button size="large" style="background: #fe4a49; color: white; border: 0" @click="showModal = true">
                    <icon name="paper-plane" style="padding-right: 7px"></icon>
                    <span>Try News Weaver</span>
                </el-button>
            </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <div style="margin-top: 10%">
                <a href="https://www.github.com/rud156/news-weaver" target="_blank">
                    <el-button size="large" style="background: #fe4a49; color: white; border: 0">
                        <icon name="github" style="padding-right: 7px"></icon>
                        <span>View On Github</span>
                    </el-button>
                </a>
            </div>
        </el-col>
    </el-row>
</template>


<script>
    export default {
        data() {
            return {
                user: {
                    username: '',
                    password: '',
                    rePassword: ''
                },
                showModal: false,
                width: 400,
                height: 270
            };
        }
    };

</script>


<style scoped>
    #block {
        background: linear-gradient(to right, #fed766, #fe4a49);
        padding: 50px 0;
        min-height: 100%;
        margin: 0 !important;
    }

    #logo-text {
        border-bottom: 1px solid white;
        border-right: 1px solid white;
        position: relative;
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