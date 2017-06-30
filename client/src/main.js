// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import  ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';
Vue.component('icon', Icon);

import Vodal from 'vodal';
Vue.component(Vodal.name, Vodal);
import 'vodal/common.css';
import 'vodal/flip.css';

import store from './store';

Vue.config.productionTip = false;
Vue.use(ElementUI);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
});
// #fe4a49 #2ab7ca #fed766 #e6e6ea #f4f4f8