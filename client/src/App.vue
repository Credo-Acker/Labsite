<template>
    <div id="app">
        <router-view></router-view>
        <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
    name: 'App',
    components: {
        // HelloWorld
    }
}
</script>

<style>
body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,code,form,fieldset,legend,input,textarea,p,blockquote,th,td,hr,button,article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section {
    margin: 0;
    padding: 0;
}

a {
    text-decoration: none;
}

li {
    list-style: none;
}

button:focus,input:focus {
    outline: none;
}

#app {
    position: absolute;
    min-width: 1000px;
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
}
</style>
