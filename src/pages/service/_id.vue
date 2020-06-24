<template>
  <v-app>
    <app-bar></app-bar>
    <v-main class="background">
      <v-container fluid>
        <info-card
          :service-id="this.serviceId"
          class="mt-4 mx-auto"
        ></info-card>
        <workflow-card class="mt-8 mx-auto"></workflow-card>
        <run-card class="mt-8 mx-auto mb-4"></run-card>
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue'
import { Service } from '@/store/service'
import AppBar from '@/components/AppBar.vue'
import InfoCard from '@/components/service/InfoCard.vue'
import RunCard from '@/components/service/RunCard.vue'
import WorkflowCard from '@/components/service/WorkflowCard.vue'

export default Vue.extend({
  components: {
    AppBar,
    InfoCard,
    RunCard,
    WorkflowCard
  },
  validate({ params, store }): boolean {
    return !store.state.service.services
      .map((service: Service) => service.uuid)
      .includes(params.id)
  },
  computed: {
    serviceId(): string {
      return this.$route.params.id
    }
  }
})
</script>
