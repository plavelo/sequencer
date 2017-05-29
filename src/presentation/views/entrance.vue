<template>
    <div>
        <div v-if="isAuthInitialized">
            <div class="background">
                <div class="title">#sequencer</div>
                <div id="auth-container"></div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import * as Firebase from 'firebase'
import * as FirebaseUI from 'firebaseui'
import * as config from '@/config/dev'

export default {
  name: 'entrance',
  data () {
    return {
      uiInitialized: false
    }
  },
  mounted () {
    this.checkAuthState()
  },
  computed: {
    ...mapGetters([
      'authState',
      'isAuthInitialized',
      'isUnregistered',
      'isLoggedIn'
    ])
  },
  watch: {
    authState (curr, prev) {
      this.checkAuthState()
    }
  },
  methods: {
    checkAuthState () {
      if (this.uiInitialized) {
        return
      }
      if (!this.isAuthInitialized) {
        return
      }
      if (this.isLoggedIn) {
        this.$router.push({name: 'sequencer'})
        return
      }
      this.uiInitialized = true
      // unauthenticated or unregistered
      Vue.nextTick(() => {
        const ui = new FirebaseUI.auth.AuthUI(Firebase.auth())
        const signInSuccessUrl = this.isUnregistered ? `${config.UI_URL}/#/signup` : `${config.UI_URL}/#/sequencer`
        const uiConfig = {
          signInSuccessUrl: signInSuccessUrl,
          signInOptions: [
            Firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            Firebase.auth.EmailAuthProvider.PROVIDER_ID
          ],
          tosUrl: config.UI_URL
        }
        ui.start('#auth-container', uiConfig)
      })
    }
  }
}
</script>

<style src="%/firebaseui/dist/firebaseui.css">
.background {
    width: 100%;
    height: 480px;
    background: linear-gradient(to bottom right, #1e2aad, #6f178f);
}
.title {
    line-height: 280px;
    text-align: center;
    font-family: "Lucida Sans";
    font-size: 48px;
    font-weight: bold;
    color: #FFFFFF;
}
</style>
