<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs-header />
        <service-card class="mx-auto mb-4" />
      </v-container>
    </v-main>
    <app-footer />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MyWindow } from '@/plugins/localStorage'
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import BreadcrumbsHeader from '@/components/BreadcrumbsHeader.vue'
import ServiceCard from '@/components/index/ServiceCard.vue'

export default defineComponent({
  components: {
    AppBar,
    AppFooter,
    BreadcrumbsHeader,
    ServiceCard,
  },

  middleware({ store }) {
    ;(window as unknown as MyWindow).onNuxtReady(async () => {
      const queue = [store.dispatch('services/updateAllServices')]
      await Promise.all(queue)
    })
  },
})
</script>
