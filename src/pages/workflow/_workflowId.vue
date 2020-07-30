<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <template v-if="existWorkflowId">
          <info-card :workflow-id="workflowId" class="mx-auto mt-4" />
          <execute-card
            :service-id="serviceId"
            :workflow-id="workflowId"
            class="mx-auto mt-8 mb-4"
          />
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
import ExecuteCard from '@/components/workflow/ExecuteCard.vue'
import InfoCard from '@/components/workflow/InfoCard.vue'
import { Service, Workflow } from '@/types'

export default Vue.extend({
  components: {
    AppBar,
    ExecuteCard,
    InfoCard
  },
  computed: {
    existWorkflowId(): boolean {
      return this.$store.getters['workflow/existWorkflowId'](
        this.$route.params.workflowId
      )
    },
    workflowId(): string {
      return this.$route.params.workflowId
    },
    serviceId(): string {
      return (this.$store.getters['workflow/workflowFilteredById'](
        this.$route.params.workflowId
      ) as Workflow).serviceId
    }
  }
})
</script>
