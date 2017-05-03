import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/domain/store'
Vue.use(VueRouter)

import Sequencer from '@/presentation/views/sequencer'

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: Sequencer
    }
  ]
})

new Vue({
  router: router,
  store: store
}).$mount('#app')
