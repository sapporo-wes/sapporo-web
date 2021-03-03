<template>
  <v-app-bar :color="$colors.indigo.darken2" app elevation="8" absolute>
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/">
        <img src="~/assets/logo.svg" alt="logo" height="60" class="mt-1" />
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-btn href="https://github.com/ddbj/SAPPORO-web" color="white" outlined>
      GitHub
      <v-icon class="ml-2" color="white"> mdi-github </v-icon>
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
