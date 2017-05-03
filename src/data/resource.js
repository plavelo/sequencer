import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

export const DataResource = Vue.resource('https://api.github.com/repos/plavelo/vuejs-practice/commits')
