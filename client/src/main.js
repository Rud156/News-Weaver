// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

import store from './store';
import './assets/index.css';
import './assets/loader.css';
import './assets/masonry.css';
require('smoothscroll-polyfill').polyfill();
require('babel-polyfill');

import moment from 'moment';
import he from 'he';
Vue.filter('ago', date => {
    return moment(date).fromNow();
});
Vue.filter('truncate', data => {
    return data.substring(0, 100) + '...';
});
Vue.filter('removeHTML', data => {
    return he.decode(data.replace(/<[^>]+>/g, ''));
});
Vue.filter('titleCase', data => {
    data = data.trim();
    return data.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
});
Vue.filter('capitalCase', data => {
    return data.charAt(0).toUpperCase() + data.slice(1);
});
Vue.filter('decodeHTML', data => {
    return he.decode(data);
});

Vue.config.productionTip = false;

import 'vuetify/dist/vuetify.min.css';
import Vuetify from 'vuetify';
Vue.use(Vuetify);

router.beforeEach((to, from, next) => {
    if (window.localStorage.getItem('user') != null && store.state.username === '')
        store.commit('setUser', JSON.parse(window.localStorage.getItem('user')));

    if (to.path === '/') {
        if (window.localStorage.getItem('user') !== null)
            router.push({
                path: 'dashboard/all'
            });
        else
            next();
    } else
        next();
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: {
        App
    }
});
// #fe4a49 #2ab7ca #fed766 #e6e6ea #f4f4f8
