<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <service-card class="mt-4 mx-auto" />
        <run-card class="mt-8 mx-auto mb-4" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import AppBar from '@/components/AppBar.vue'
import RunCard from '@/components/index/RunCard.vue'
import ServiceCard from '@/components/index/ServiceCard.vue'
import { MyWindow } from '@/plugins/localStorage'

// TODO Update import and export button
// TODO Add reload state button
// TODO Check run delete function
export default Vue.extend({
  components: {
    AppBar,
    RunCard,
    ServiceCard
  },
  async middleware({ store }) {
    ;((window as unknown) as MyWindow).onNuxtReady(async () => {
      await store.dispatch('service/updateAllServicesState')
      await store.dispatch('run/updateAllRunsState')
    })
  }
})
</script>
