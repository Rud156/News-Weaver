// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
import 'element-ui/lib/theme-default/base.css';
import 'vue2-animate/dist/vue2-animate.min.css';

import Vue2Filters from 'vue2-filters';
Vue.use(Vue2Filters);

import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';
Vue.component('icon', Icon);

import Vodal from 'vodal';
Vue.component(Vodal.name, Vodal);
import 'vodal/common.css';
import 'vodal/flip.css';

import store from './store';
import './assets/index.css';
import './assets/loader.css';

Vue.config.productionTip = false;
Vue.use(ElementUI);

router.beforeEach((to, from, next) => {
    if (window.localStorage.getItem('user') != null && store.state.username === '')
        store.commit('setUser', JSON.parse(window.localStorage.getItem('user')));

    if (to.path === '/') {
        if (window.localStorage.getItem('user') !== null)
            router.push({ path: 'dashboard' });
        else
            next();
    }
    else
        next();
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
});
// #fe4a49 #2ab7ca #fed766 #e6e6ea #f4f4f8