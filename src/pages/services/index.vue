<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs-header />
        <template v-if="existServiceId">
          <info-card :service-id="serviceId" class="mx-auto" />
          <workflow-card :service-id="serviceId" class="mt-8 mx-auto" />
          <run-card :service-id="serviceId" class="mt-8 mx-auto mb-4" />
        </template>
        <template v-else>{{
          `Service id: ${serviceId} does not exist.`
        }}</template>
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
import InfoCard from '@/components/services/InfoCard.vue'
import RunCard from '@/components/services/RunCard.vue'
import WorkflowCard from '@/components/services/WorkflowCard.vue'

export default defineComponent({
  components: {
    AppBar,
    AppFooter,
    BreadcrumbsHeader,
    InfoCard,
    RunCard,
    WorkflowCard,
  },

  middleware({ store, route }) {
    let serviceId = route.query.serviceId || ''
    if (Array.isArray(serviceId)) {
      serviceId = serviceId[0] || ''
    }
    ;(window as unknown as MyWindow).onNuxtReady(async () => {
      await store.dispatch('services/updateService', serviceId)
      await store.dispatch('runs/updateAllRunsStateByService', serviceId)
    })
  },

  computed: {
    existServiceId() {
      return this.$store.getters['services/serviceIds'].includes(this.serviceId)
    },

    serviceId() {
      const serviceId = this.$route.query.serviceId || ''
      if (Array.isArray(serviceId)) {
        return serviceId[0] || ''
      } else {
        return serviceId
      }
    },
  },
})
</script>
