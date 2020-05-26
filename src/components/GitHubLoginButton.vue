<template>
  <v-btn
    :color="this.$colors.grey.darken3"
    @click="loginWithGitHub"
    class="white--text"
    style="text-transform: none;"
    width="260"
    >Login with GitHub
    <img :src="require('@/assets/github_mark.png')" class="ml-2" height="24"
  /></v-btn>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  methods: {
    loginWithGitHub(): void {
      this.$auth.loginWith('github')
    }
  }
})
</script>
