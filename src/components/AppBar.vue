<template>
  <v-app-bar :color="$colors.blue.darken1" app absolute dense>
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/">
        <img src="~/assets/logo.svg" alt="logo" height="48" class="mt-2" />
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-btn
      v-if="$route.path !== '/state'"
      class="mr-4"
      color="white"
      nuxt
      outlined
      to="state"
    >
      <v-icon class="mr-2" color="white" v-text="'mdi-database'" />
      State
    </v-btn>

    <v-btn
      class="text-capitalize"
      color="white"
      href="https://github.com/ddbj/sapporo-web"
      outlined
    >
      <v-icon class="mr-2" color="white" v-text="'mdi-github'" />
      GitHub
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'

type Data = Record<string, unknown>

type Methods = Record<string, unknown>

type Computed = Record<string, unknown>

type Props = Record<string, unknown>

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {}

export default Vue.extend(options)
</script>

<style scoped>
.v-list-item__icon:first-child {
  margin-right: 16px;
}
</style>
