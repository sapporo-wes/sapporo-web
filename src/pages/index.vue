<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <service-card class="mt-4 mx-auto"></service-card>
        <run-card class="mt-8 mx-auto mb-4"></run-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import AppBar from '@/components/AppBar.vue'
import RunCard from '@/components/index/RunCard.vue'
import ServiceCard from '@/components/index/ServiceCard.vue'

export default Vue.extend({
  components: {
    AppBar,
    RunCard,
    ServiceCard
  }
})
</script>
