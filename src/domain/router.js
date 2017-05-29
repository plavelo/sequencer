import Vue from 'vue'
import VueRouter from 'vue-router'
import Entrance from '@/presentation/views/entrance'
import Signup from '@/presentation/views/signup'
import Sequencer from '@/presentation/views/sequencer'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'entrance',
      component: Entrance
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/sequencer',
      name: 'sequencer',
      component: Sequencer
    }
  ]
})
