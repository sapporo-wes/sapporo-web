<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <v-card max-width="1200" class="mx-auto">
          <div class="d-flex flex-column mx-6 pt-4">
            <div
              class="card-header"
              :style="{
                color: $vuetify.theme.themes.light.error,
              }"
              v-text="'Error occurred!!'"
            />
            <div class="mx-6" v-text="'An unexpected error has occurred.'" />
            <div
              class="mx-6 mt-2 mb-6 elevation-2 pa-2"
              :style="{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                outline: `solid 1px ${$colors.grey.lighten1}`,
              }"
              v-text="JSON.stringify(error, null, 2)"
            />
          </div>
          <div class="d-flex justify-end pb-4">
            <v-btn
              outlined
              :color="$colors.grey.darken2"
              class="mr-12"
              @click.stop="$router.push('/')"
              v-text="'Back to Home'"
            />
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import AppBar from '@/components/AppBar.vue'

export default defineComponent({
  components: {
    AppBar,
  },

  props: {
    error: {
      type: Object as PropType<any>,
      default: () => ({}),
      required: true,
    },
  },
})
</script>
