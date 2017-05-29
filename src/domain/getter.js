import * as constant from '@/domain/constant'

export default {
  token: state => state.token,
  uid: state => state.uid,
  authState: state => state.authState,
  isAuthInitialized: state => state.authState !== constant.AUTH_STATE.UNINITIALIZED,
  isUnregistered: state => state.authState === constant.AUTH_STATE.UNREGISTERED,
  isLoggedIn: state => state.authState === constant.AUTH_STATE.LOGGED_IN,
  displayName: state => state.displayName
}
