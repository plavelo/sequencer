import Vue from 'vue'
import router from '@/domain/router'
import store from '@/domain/store'

new Vue({
  router: router,
  store: store,
  created () {
    store.dispatch('updateAuthState')
  }
}).$mount('#app')
