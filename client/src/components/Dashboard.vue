<template>
    <div style="width: 100%; min-height: 100%; font-size: 25px">
        <el-menu mode="horizontal" @select="handleSelect" :default-active="'dashboard'">
            <el-menu-item index="logo" style="font-size: 30px">News Weaver</el-menu-item>
            <el-menu-item index="logout" style="float: right">Logout</el-menu-item>
            <el-menu-item index="dashboard" style="float: right">
                {{formatUsername()}}'s Dashboard
            </el-menu-item>
        </el-menu>
        <vodal :show="$store.state.displayLoader" :closeButton="false" :width="50" :height="60" @hide="toggleLoader">
            <loader></loader>
        </vodal>
        <div style="margin-top: 14px; font-family: 'Signika', sans-serif">
            <span v-for=" nav in navigation " :key="nav " style="cursor: pointer; padding: 0 21px " :style="[nav === currentNav? { color: '#20a0ff' } : { color: 'black' }] "
                @click="changeView(nav) ">{{ nav | capitalize }}</span>
        </div>
        <br />
        <transition name="fade ">
            <router-view></router-view>
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
                navigation: ['all', 'sources', 'favourites', 'settings'],
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
                        this.$router.push({ path: '/dashboard/all/news_items' });
                        break;
                }
            },
            changeView(viewName) {
                switch (viewName) {
                    case 'all':
                        this.currentNav = viewName;
                        this.$router.push({ path: '/dashboard/all/all_news' });
                        break;

                    default:
                        this.currentNav = viewName;
                        this.$router.push({ path: `/dashboard/${viewName}` });
                        break;
                }
            }
        },
        components: {
            Loader
        }
    };

</script>