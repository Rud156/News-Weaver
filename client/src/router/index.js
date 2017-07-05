import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import Dashboard from '@/components/Dashboard';
import All from '@/components/All';
import Sources from '@/components/Sources';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
            children: [
                {
                    path: 'all/:id',
                    name: 'all',
                    component: All,
                    props: true
                },
                {
                    path: 'sources',
                    name: 'sources',
                    component: Sources
                }
            ]
        }
    ]
});