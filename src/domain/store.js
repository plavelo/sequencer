import Vue from 'vue'
import Vuex from 'vuex'
import mutations from '@/domain/mutation'
import actions from '@/domain/action'

Vue.use(Vuex)

const state = {
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
