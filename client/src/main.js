import Vue from 'vue'
import App from './App.vue'
import router from './route/index.js'
import ElementUI from 'element-ui'
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
axios.defaults.withCredentials = true
Vue.prototype.$http = axios
Vue.use(router)
Vue.use(ElementUI)

new Vue({
    render: h => h(App),
    router
}).$mount('#app')
