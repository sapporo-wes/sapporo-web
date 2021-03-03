<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs />
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
import { MyWindow } from '@/plugins/localStorage'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import InfoCard from '@/components/services/InfoCard.vue'
import RunCard from '@/components/services/RunCard.vue'
import Vue from 'vue'
import WorkflowCard from '@/components/services/WorkflowCard.vue'

type Data = Record<string, unknown>

type Methods = Record<string, unknown>

type Computed = {
  existServiceId: boolean
  serviceId: string
}

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
    InfoCard,
    RunCard,
    WorkflowCard,
  },

  middleware({ store, route }) {
    let serviceId = route.query.serviceId || ''
    if (Array.isArray(serviceId)) {
      serviceId = serviceId[0] || ''
    }
    ;((window as unknown) as MyWindow).onNuxtReady(async () => {
      await store.dispatch('services/updateServiceState', serviceId)
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
}

export default Vue.extend(options)
</script>
