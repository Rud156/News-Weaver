<template>
    <div style="width: 100%; min-height: 100%; font-size: 25px">
        <el-menu mode="horizontal" @select="handleSelect" :default-active="'dashboard'">
            <el-menu-item index="logo" style="font-size: 30px">News Weaver</el-menu-item>
            <el-menu-item index="logout" style="float: right">Logout</el-menu-item>
            <el-menu-item index="dashboard" style="float: right">
                {{$store.getters.formatUsername}}'s Dashboard
            </el-menu-item>
        </el-menu>
        <vodal :show="$store.state.displayLoader" @hide="toggleLoader">
            <loader/>
        </vodal>
        <div style="margin-top: 14px; font-family: 'Playball', cursive">
            <span v-for="nav in naviagtion" :key="nav" style="cursor: pointer; padding: 0 21px" :style="[nav === currentNav ? { color: '#20a0ff' } : { color: 'black' }]"
                @click="changeView(nav)">{{ nav | capitalize }}</span>
        </div>
        <br />
        <transition name="fade">
            <router-view></router-view>
        </transition>
    </div>
</template>


<script>
    import { mapMutations } from 'vuex';
    import axios from 'axios';
    import Loader from './Loader';

    export default {
        data() {
            return {
                naviagtion: ['all', 'sources', 'favourites', 'settings'],
                currentNav: this.$route.path.split('/')[2]
            };
        },
        watch: {
            '$route'(to, from) {
                this.currentNav = to.path.split('/')[2];
            }
        },
        methods: {
            ...mapMutations([
                'removeUser',
                'toggleLoader'
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
                console.log(this.$route);
                this.currentNav = viewName;
                this.$router.push({ path: '/dashboard/' + viewName });
            }
        }
    };

</script>