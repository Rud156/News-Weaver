import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Auth from '@/components/Auth';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/auth',
            name: 'Auth',
            component: Auth
        }
    ]
});