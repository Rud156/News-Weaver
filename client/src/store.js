import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const store = new Vuex.Store({
    strict: true,
    state: {
        username: '',
        token: '',
        infoMessage: '',
        showModal: false,
        displayLoader: false
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
        }
    },
    mutations: {
        setUser(state, user) {
            state.username = user.username;
            state.token = user.token;
            window.localStorage.setItem('user', JSON.stringify(user));
        },
        removeUser(state) {
            state.username = '';
            state.token = '';
            window.localStorage.removeItem('user');
        },
        openModal(state, message) {
            state.showModal = true;
            state.infoMessage = message;
        },
        closeModal(state) {
            state.infoMessage = '';
            state.showModal = false;
        },
        toggleLoader(state) {
            state.displayLoader = !state.displayLoader;   
        }
    }
});

export default store;
