<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs />
        <service-card class="mx-auto mb-4" />
      </v-container>
    </v-main>
    <app-footer />
  </v-app>
</template>

<script lang="ts">
import { MyWindow } from '@/plugins/localStorage'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import ServiceCard from '@/components/index/ServiceCard.vue'
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
> = {
  components: {
    AppBar,
    AppFooter,
    Breadcrumbs,
    ServiceCard,
  },

  middleware({ store }) {
    ;((window as unknown) as MyWindow).onNuxtReady(async () => {
      const queue = [
        store.dispatch('services/updateAllServices'),
      ]
      await Promise.all(queue)
    })
  },
}

export default Vue.extend(options)
</script>
