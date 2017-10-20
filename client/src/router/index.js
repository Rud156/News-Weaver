import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import Dashboard from '@/components/Dashboard';
import All from '@/components/All';
import Sources from '@/components/Sources';
import Favourites from '@/components/Favourites';
import ReadLater from '@/components/ReadLater';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [{
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard,
            children: [{
                    path: 'all',
                    name: 'all_news',
                    component: All,
                    props: {
                        displayAllNews: true
                    }
                },
                {
                    path: 'all/:id',
                    name: 'all',
                    component: All,
                    props: (route) => {
                        return {
                            id: route.params.id,
                            displayAllNews: false
                        };
                    }
                },
                {
                    path: 'sources',
                    name: 'sources',
                    component: Sources
                },
                {
                    path: 'favourites',
                    name: 'favourites',
                    component: Favourites
                },
                {
                    path: 'read_later',
                    name: 'read_later',
                    component: ReadLater
                },
                {
                    path: '*',
                    redirect: '/dashboard/all'
                }
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ],
    scrollBehavior() {
        return {
            x: 0,
            y: 0
        };
    }
});
