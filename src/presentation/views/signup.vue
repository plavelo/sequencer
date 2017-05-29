<template>
    <div class="background">
        <div class="title">#signup</div>
        <div>
            ID
            <input v-model="id">
        </div>
        <button @click="register()">Register</button>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'signup',
  data () {
    return {
      id: ''
    }
  },
  computed: {
    ...mapGetters([
      'token',
      'uid',
      'isLoggedIn'
    ])
  },
  watch: {
    isLoggedIn (curr, prev) {
      if (!curr) {
        return
      }
      this.$router.push({name: 'sequencer'})
    }
  },
  methods: {
    ...mapActions([
      'registerUser'
    ]),
    register () {
      if (this.id === '') {
        return
      }
      this.registerUser({
        token: this.token,
        uid: this.uid,
        userName: this.id
      })
    }
  }
}
</script>

<style>
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
