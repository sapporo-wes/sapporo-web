<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <template v-if="this.existServiceId">
          <info-card :service-id="this.serviceId" class="mt-4 mx-auto" />
          <workflow-card :service-id="this.serviceId" class="mt-8 mx-auto" />
          <run-card :service-id="this.serviceId" class="mt-8 mx-auto mb-4" />
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
import { MyWindow } from '@/plugins/localStorage'

// TODO SAPPORO WES Mode
export default Vue.extend({
  components: {
    AppBar,
    InfoCard,
    RunCard,
    WorkflowCard
  },
  async middleware({ store, route }) {
    ;((window as unknown) as MyWindow).onNuxtReady(async () => {
      await store.dispatch('service/updateServiceState', route.params.serviceId)
      await store.dispatch(
        'run/updateAllRunsStateByService',
        route.params.serviceId
      )
    })
  },
  computed: {
    existServiceId(): boolean {
      return this.$store.getters['service/existId'](this.serviceId)
    },
    serviceId(): string {
      return this.$route.params.serviceId
    }
  }
})
</script>
