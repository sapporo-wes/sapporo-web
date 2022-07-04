<template>
  <v-app-bar :color="$colors.indigo.darken1" app absolute dense>
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/">
        <img src="~/assets/logo.svg" alt="logo" height="48" class="mt-2" />
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-btn
      class="text-capitalize"
      color="white"
      href="https://hackmd.io/@suecharo/sapporo-web-docs"
      outlined
    >
      <v-icon left color="white" v-text="'mdi-book-open-outline'" />
      Docs
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
