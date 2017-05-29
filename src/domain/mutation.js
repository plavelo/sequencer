import * as types from '@/domain/mutation-type'

export default {
  [types.UPDATE_TOKEN] (state, token) {
    state.token = token
  },
  [types.UPDATE_UID] (state, uid) {
    state.uid = uid
  },
  [types.UPDATE_AUTH_STATUS] (state, authState) {
    state.authState = authState
  },
  [types.UPDATE_DISPLAY_NAME] (state, displayName) {
    state.displayName = displayName
  }
}
