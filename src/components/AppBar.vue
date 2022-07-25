<template>
  <v-app-bar absolute app :color="$colors.indigo.darken1" dense>
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/">
        <img alt="logo" class="mt-2" height="48" src="~/assets/logo.svg" />
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-btn
      class="text-capitalize"
      color="white"
      href="https://hackmd.io/@suecharo/sapporo-web-docs"
      outlined
    >
      <v-icon color="white" left v-text="'mdi-book-open-outline'" />
      Docs
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
