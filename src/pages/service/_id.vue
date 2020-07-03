<template>
  <v-app>
    <app-bar></app-bar>
    <v-main class="background">
      <v-container fluid>
        <template v-if="this.existServiceId">
          <info-card
            :service-id="this.serviceId"
            class="mt-4 mx-auto"
          ></info-card>
          <workflow-card
            :service-id="this.serviceId"
            class="mt-8 mx-auto"
          ></workflow-card>
          <run-card class="mt-8 mx-auto mb-4"></run-card>
        </template>
        <template v-else>Does not exist.</template>
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue'
import { ComponentOptions } from 'vue/types'
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
  computed: {
    existServiceId(): boolean {
      return this.$store.state.service.services.some(
        (service: Service) => service.uuid === this.$route.params.id
      )
    },
    serviceId(): string {
      return this.$route.params.id
    }
  }
})
</script>
