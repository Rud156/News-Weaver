import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const store = new Vuex.Store({
    strict: true,
    state: {
        username: '',
        token: '',
        displayLoader: false,
        feedIndexCount: 0,
        baseServerURL: 'http://localhost:3000',
        // baseServerURL: 'https://news-weaver.herokuapp.com',
        feedSources: []
    },
    getters: {
        formatUsername(state) {
            if (state.username === '')
                return '';

            return state.username.toLowerCase().split(' ').map((word) => {
                return word.replace(word[0], word[0].toUpperCase());
            }).join(' ');
        },
        getToken(state) {
            return state.token;
        },
        getFeedIndexCount(state) {
            return state.feedIndexCount;
        },
        getBaseURL(state) {
            return state.baseServerURL;
        },
        getFeedSources(state) {
            return state.feedSources;
        }
    },
    mutations: {
        setUser(state, user) {
            state.username = user.username;
            state.token = user.token;
            window.localStorage.setItem('user', JSON.stringify(user));
        },
        incrementFeedIndex(state) {
            state.feedIndexCount++;
        },
        resetFeedIndexCount(state) {
            state.feedIndexCount = 0;
        },
        removeUser(state) {
            state.username = '';
            state.token = '';
            window.localStorage.removeItem('user');
        },
        toggleLoader(state) {
            state.displayLoader = !state.displayLoader;
        },
        setFeedSources(state, sources) {
            state.feedSources = sources;
        },
        removeFeedSources(state, hash) {
            state.feedSources = state.feedSources.filter(element => {
                return element.hash !== hash;
            });
        },
        addFeedSource(state, feed) {
            state.feedSources.push(feed);
        }
    }
});

export default store;