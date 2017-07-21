<template>
    <div style="width: 100%; min-height: 100%;" class="font-style">
        <el-menu mode="horizontal" @select="handleSelect" :default-active="'dashboard'">
            <el-menu-item index="logo" style="font-size: 30px" class="brand-logo">News Weaver</el-menu-item>
            <el-menu-item index="logout" style="float: right">Logout</el-menu-item>
            <el-menu-item index="dashboard" style="float: right">
                Dashboard
            </el-menu-item>
        </el-menu>
        <vodal :show="$store.state.displayLoader" :closeButton="false" :width="50" :height="60" @hide="toggleLoader">
            <loader></loader>
        </vodal>
        <div style="margin-top: 14px; font-family: 'Signika', sans-serif">
            <router-link :to="'/dashboard/all/all_news'" style="padding: 0 21px" active-class="dashboard-link-active" class="dashboard-link-default">
                All
            </router-link>
            <router-link :to="'/dashboard/' + nav" v-for="nav in navigation" :key="nav " style="padding: 0 21px" active-class="dashboard-link-active" class="dashboard-link-default">
                {{ nav | capitalize }}
            </router-link>
        </div>
        <br />
        <transition name="fade">
            <router-view @validation-failed="handleSelect"></router-view>
        </transition>
    </div>
</template>


<script>
    import { mapMutations, mapGetters } from 'vuex';
    import axios from 'axios';
    import Loader from './sub-components/Loader';

    export default {
        data() {
            return {
                navigation: ['sources', 'favourites']
            };
        },
        mounted(){
            window.document.title = `${this.formatUsername()}'s Dashboard`;
        },
        methods: {
            ...mapMutations([
                'removeUser',
                'toggleLoader'
            ]),
            ...mapGetters([
                'formatUsername'
            ]),
            handleSelect(key, keyPath) {
                switch (key) {
                    case "logout":
                        this.removeUser();
                        this.$router.push({ path: '/' });
                        break;
                    default:
                        this.$router.push({ path: '/dashboard/all/all_news' });
                        break;
                }
            }
        },
        components: {
            Loader
        }
    };

</script>