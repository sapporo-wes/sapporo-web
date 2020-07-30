<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <template v-if="this.existServiceId">
          <info-card :service-id="this.serviceId" class="mt-4 mx-auto" />
          <workflow-card :service-id="this.serviceId" class="mt-8 mx-auto" />
          <run-card class="mt-8 mx-auto mb-4" />
        </template>
        <template v-else>Does not exist.</template>
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue'
import { ComponentOptions } from 'vue/types'
import AppBar from '@/components/AppBar.vue'
import InfoCard from '@/components/service/InfoCard.vue'
import RunCard from '@/components/service/RunCard.vue'
import WorkflowCard from '@/components/service/WorkflowCard.vue'
import { Service } from '@/types'

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
        (service: Service) => service.id === this.$route.params.serviceId
      )
    },
    serviceId(): string {
      return this.$route.params.serviceId
    }
  }
})
</script>
