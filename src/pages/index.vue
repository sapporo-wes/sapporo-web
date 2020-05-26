<template>
  <v-app>
    <v-content class="background-gradient">
      <v-container fluid class="d-flex justify-center">
        <login-card v-if="!this.$auth.loggedIn" style="margin-top: 120px;" />
        <div v-else>
          <app-bar />
          <div class="app-bar-height-margin">
            {{ this.$auth.$state }}
          </div>
        </div>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import LoginCard from '~/components/LoginCard.vue'
import AppBar from '~/components/AppBar.vue'

export default Vue.extend({
  components: {
    LoginCard,
    AppBar
  }
})
</script>
