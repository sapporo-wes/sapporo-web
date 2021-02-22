<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs />
        <template v-if="existWorkflowId">
          <info-card :workflow-id="workflowId" class="mx-auto" />
          <v-alert
            max-width="1200"
            class="mx-auto mt-8"
            type="error"
            elevation="8"
            :value="service.state !== 'Available'"
            >{{
              `Workflow cannot be executed because the status of service ${service.name} is not available.`
            }}
          </v-alert>
          <execute-card :workflow-id="workflowId" class="mx-auto mt-8 mb-4" />
        </template>
        <template v-else>{{
          `Workflow id: ${workflowId} does not exist.`
        }}</template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { MyWindow } from '@/plugins/localStorage'
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Workflow } from '@/store/workflows'
import AppBar from '@/components/AppBar.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import ExecuteCard from '@/components/workflows/ExecuteCard.vue'
import InfoCard from '@/components/workflows/InfoCard.vue'
import Vue from 'vue'

type Data = Record<string, unknown>

type Methods = Record<string, unknown>

type Computed = {
  existWorkflowId: boolean
  workflowId: string
  service: Service
  workflow: Workflow
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
    Breadcrumbs,
    ExecuteCard,
    InfoCard,
  },

  middleware({ store, route }) {
    let workflowId = route.query.workflowId || ''
    if (Array.isArray(workflowId)) {
      workflowId = workflowId[0] || ''
    }
    ;((window as unknown) as MyWindow).onNuxtReady(async () => {
      await store.dispatch(
        'services/updateServiceState',
        this.$store.getters['workflows/workflow'](workflowId).serviceId
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

    workflowId() {
      const workflowId = this.$route.query.workflowId || ''
      if (Array.isArray(workflowId)) {
        return workflowId[0] || ''
      } else {
        return workflowId
      }
    },

    existWorkflowId(): boolean {
      return this.$store.getters['workflows/existId'](this.workflowId)
    },
  },
}

export default Vue.extend(options)
</script>
