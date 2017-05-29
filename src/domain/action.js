import * as Firebase from 'firebase'
import axios from 'axios'
import * as types from '@/domain/mutation-type'
import * as constant from '@/domain/constant'
import * as config from '@/config/dev'

const instance = axios.create({
  baseURL: config.API_URL,
  timeout: 10000
})
instance.defaults.headers.post['Content-Type'] = 'application/json'

export default {
  registerUser ({ commit }, { token, uid, userName }) {
    instance.defaults.headers.common['Authorization'] = token
    instance.post(`/users`, JSON.stringify({
      uid: uid,
      userName: userName,
      displayName: userName
    })).then(response => {
      commit(types.UPDATE_AUTH_STATUS, constant.AUTH_STATE.LOGGED_IN)
    }).catch(error => {
      if (error == null) {
        return
      }
      commit(types.UPDATE_AUTH_STATUS, constant.AUTH_STATE.UNREGISTERED)
    })
  },
  updateAuthState ({ commit }) {
    Firebase.initializeApp(config.FIREBASE_CONFIG)
    Firebase.auth().onAuthStateChanged(user => {
      if (user === null) {
        // token not exists
        commit(types.UPDATE_AUTH_STATUS, constant.AUTH_STATE.UNAUTHENTICATED)
        commit(types.UPDATE_UID, '')
        commit(types.UPDATE_DISPLAY_NAME, '')
        commit(types.UPDATE_TOKEN, '')
        return
      }
      // signed in
      commit(types.UPDATE_UID, user.uid)
      commit(types.UPDATE_DISPLAY_NAME, user.displayName)

      user.getToken().then(token => {
        commit(types.UPDATE_TOKEN, token)
        instance.defaults.headers.common['Authorization'] = token
        instance.get(`/users/${user.uid}`).then(response => {
          // token exists and already registered
          commit(types.UPDATE_AUTH_STATUS, constant.AUTH_STATE.LOGGED_IN)
        }).catch(error => {
          if (error == null) {
            return
          }
          // token exists, but not registered
          commit(types.UPDATE_AUTH_STATUS, constant.AUTH_STATE.UNREGISTERED)
        })
      })
    })
  }
}
