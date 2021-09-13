<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs />
        <v-card max-width="1200" class="mx-auto">
          <div class="d-flex flex-column px-6 pt-4">
            <div
              class="card-header"
              :style="{
                color: $vuetify.theme.themes.light.error,
              }"
              v-text="'Error occurred!!'"
            />
            <div class="mx-6" v-text="'An unexpected error has occurred.'" />
            <div
              class="mx-6 mt-2 mb-4 elevation-2"
              :style="{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                outline: `solid 1px ${$colors.grey.lighten1}`,
              }"
              v-text="`${JSON.stringify(error, null, 2)}`"
            />
          </div>
          <div class="d-flex justify-end pb-4">
            <v-btn
              outlined
              :color="$colors.grey.darken2"
              class="mr-12"
              @click.stop="backToHome"
              v-text="'Back to Home'"
            />
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import AppBar from '@/components/AppBar.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Vue from 'vue'

type Data = Record<string, unknown>

type Methods = Record<string, unknown>

type Computed = Record<string, unknown>

type Props = {
  error: unknown
}

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  components: {
    AppBar,
    Breadcrumbs,
  },

  props: {
    error: {},
  },

  methods: {
    backToHome() {
      this.$router.push('/')
      location.reload()
    },
  },
}

export default Vue.extend(options)
</script>
