<template>
  <v-app>
    <v-content class="background-gradient">
      <v-container fluid class="d-flex flex-column align-center">
        <div class="mt-12 title info--text">Doing callback now...</div>
        <div class="mt-6 subtitle-1 info--text">
          If you wait for a while and don't return, click
          <nuxt-link to="/">back to home page</nuxt-link>.
        </div>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>
