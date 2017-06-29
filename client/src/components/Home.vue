<template>
    <el-row :gutter="20" id="block">
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
                <router-link :to="auth">
                    <el-button size="large" style="background: #fe4a49; color: white; border: 0">
                        <icon name="paper-plane" style="padding-right: 7px"></icon>
                        <span>Try News Weaver</span>
                    </el-button>
                </router-link>
            </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <div style="margin-top: 10%">
                <a href="https://www.github.com/rud156/news-weaver" target="_blank">
                    <el-button :plain="true" size="large" style="background: #fe4a49; color: white; border: 0">
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
                auth: 'auth'
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
        border: 1px solid white;
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