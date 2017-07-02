<template>
    <div style="width: 100%; min-height: 100%; font-size: 25px">
        <el-menu mode="horizontal" @select="handleSelect" :default-active="'dashboard'">
            <el-menu-item index="logo" style="font-size: 30px">News Weaver</el-menu-item>
            <el-menu-item index="logout" style="float: right">Logout</el-menu-item>
            <el-menu-item index="dashboard" style="float: right">
                {{$store.getters.formatUsername}}'s Dashboard
            </el-menu-item>
        </el-menu>
        <div style="margin-top: 14px; font-family: 'Playball', cursive">
            <span v-for="nav in naviagtion" style="cursor: pointer; padding: 0 21px" :style="[nav === currentNav ? { color: '#20a0ff' } : { color: 'black' }]"
                @click="changeView(nav)">{{ nav | capitalize }}</span>
        </div>
        <br />
        <transition name="fade" enter-active-class="fadeInLeft" leave-active-class="fadeOutRight">
            <router-view></router-view>
        </transition>
    </div>
</template>


<script>
    import { mapMutations } from 'vuex';
    import axios from 'axios';

    export default {
        data() {
            return {
                naviagtion: ['all', 'sources', 'favourites', 'settings'],
                currentNav: 'all'
            };
        },
        methods: {
            ...mapMutations([
                'removeUser'
            ]),
            handleSelect(key, keyPath) {
                switch (key) {
                    case "logout":
                        this.removeUser();
                        this.$router.push({ path: '/' });
                        break;
                    default:
                        break;
                }
            },
            changeView(viewName) {
                this.$router.push({ path: '/dashboard/' + viewName });
            }
        }
    };

</script>