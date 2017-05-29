import Vue from 'vue'
import Vuex from 'vuex'
import mutations from '@/domain/mutation'
import actions from '@/domain/action'
import getters from '@/domain/getter'
import * as constant from '@/domain/constant'

Vue.use(Vuex)

const state = {
  token: '',
  uid: '',
  displayName: '',
  authState: constant.AUTH_STATE.UNINITIALIZED
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})
