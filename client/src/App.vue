<template>
    <div id="app">
        <vodal :show="$store.state.showModal" @hide="closeModal" animation="flip" :height="75" :width="500">
            <div style="font-size: 20px; text-align: center; padding: 21px">
                {{getMessage}}
            </div>
        </vodal>
        <router-view></router-view>
    </div>
</template>

<script>
    import { mapMutations } from 'vuex';

    export default {
        name: 'app',
        methods: {
            ...mapMutations([
                'closeModal'
            ])
        },
        computed: {
            getMessage() {
                return this.$store.state.infoMessage;
            }
        }
    }

</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        height: 100%;
    }
</style>