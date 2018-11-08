import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'
import router from './router'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        idToken: null,
        userId: null,
        user: null
    },
    actions: {
        setLogoutTimer({commit}, expirationTime) {
            setTimeout(() => {
                commit('clearData')
            }, expirationTime * 1000)
        },
        signup({commit, dispatch}, authData) {
            axios.post('/signupNewUser?key=AIzaSyD-5WUv6sn-9rpg2_2dJ2mHiNdyl8HW8v0', {
                email: authData.email,
                password: authData.password,
                returnSecureToken: true
            })
                .then(res => {
                    console.log(res);
                    commit('authUser', {
                        token: res.data.idToken,
                        userId: res.data.localId
                    });
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
                    localStorage.setItem('token', res.data.idToken);
                    localStorage.setItem('userId', res.data.localId);
                    localStorage.setItem('expiresIn', expirationDate);
                    dispatch('storeUser', authData);
                    dispatch('setLogoutTimer', res.data.expiresIn)
                })
                .catch(error => console.log(error))
        },
        login({commit, dispatch}, authData) {
            axios.post('/verifyPassword?key=AIzaSyD-5WUv6sn-9rpg2_2dJ2mHiNdyl8HW8v0', {
                email: authData.email,
                password: authData.password,
                returnSecureToken: true
            })
                .then(res => {
                    console.log(res);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
                    localStorage.setItem('token', res.data.idToken);
                    localStorage.setItem('expirationDate', expirationDate);
                    localStorage.setItem('userId', res.data.localId);
                    commit('authUser', {
                        token: res.data.idToken,
                        userId: res.data.localId
                    });
                    dispatch('setLogoutTimer', res.data.expiresIn)
                })
                .catch(error => console.log(error))
        },
        tryAutoLogin({commit}) {
            const token = localStorage.getItem('token');
            if (!token) {
                return
            }
            const expirationDate = localStorage.getItem('expirationDate')
            const now = new Date();
            if (now >= expirationDate) {
                return
            }
            const userId = localStorage.getItem('userId')
            commit('authUser', {
                token: token,
                userId: userId
            })
        },
        logout({commit}) {
            commit('clearData');
            localStorage.removeItem('expirationDate');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            router.replace('/signin')
        },
        storeUser({commit, state}, userData) {
            if (!state.idToken) {
                return
            }
            globalAxios.post('/users.json' + '?auth=' + state.idToken, userData)
                .then(res => console.log(res))
                .catch(error => console.log(error))
        },
        fetchUser({commit, state}, user) {
            if (!state.idToken) {
                return
            }
            globalAxios.get('/users.json' + '?auth=' + state.idToken)
                .then(res => {
                    console.log(res);
                    const data = res.data;
                    const users = [];
                    for (let key in data) {
                        const user = data[key];
                        user.id = key;
                        users.push(user)
                    }
                    console.log(users);
                    commit('storeUser', users[0])
                })
                .catch(error => console.log(error))
        }
    },
    mutations: {
        authUser(state, userData) {
            state.idToken = userData.token;
            state.userId = userData.userId;
        },
        storeUser(state, user) {
            state.user = user;
        },
        clearData(state) {
            state.userId = null;
            state.idToken = null;
        }
    },
    getters: {
        user(state) {
            return state.user
        },
        isAuth(state) {
            return state.idToken !== null
        }
    }
})