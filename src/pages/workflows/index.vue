<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs-header />
        <template v-if="existWorkflowId">
          <info-card class="mx-auto" :workflow-id="workflowId" />
          <v-alert
            class="mx-auto mt-8"
            max-width="1200"
            type="error"
            :value="service.state !== 'Available'"
            >{{
              `Workflow cannot be executed because the status of service ${service.name} is not available.`
            }}
          </v-alert>
          <execute-card class="mx-auto mt-8 mb-4" :workflow-id="workflowId" />
        </template>
        <template v-else>{{
          `Workflow id: ${workflowId} does not exist.`
        }}</template>
      </v-container>
    </v-main>
    <app-footer />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MyWindow } from '@/plugins/localStorage'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import BreadcrumbsHeader from '@/components/BreadcrumbsHeader.vue'
import ExecuteCard from '@/components/workflows/ExecuteCard.vue'
import InfoCard from '@/components/workflows/InfoCard.vue'

export default defineComponent({
  components: {
    AppBar,
    AppFooter,
    BreadcrumbsHeader,
    ExecuteCard,
    InfoCard,
  },

  middleware({ store, route }) {
    let workflowId = route.query.workflowId || ''
    if (Array.isArray(workflowId)) {
      workflowId = workflowId[0] || ''
    }
    ;(window as unknown as MyWindow).onNuxtReady(async () => {
      await store.dispatch(
        'services/updateService',
        store.getters['workflows/workflow'](workflowId).serviceId
      )
    })
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.workflow.serviceId)
    },

    workflow(): Workflow {
      return this.$store.getters['workflows/workflow'](this.workflowId)
    },

    workflowId(): string {
      const workflowId = this.$route.query.workflowId || ''
      if (Array.isArray(workflowId)) {
        return workflowId[0] || ''
      } else {
        return workflowId
      }
    },

    existWorkflowId(): boolean {
      return this.$store.getters['workflows/workflowIds'].includes(
        this.workflowId
      )
    },
  },
})
</script>
