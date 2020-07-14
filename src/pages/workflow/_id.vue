<template>
  <v-app>
    <app-bar></app-bar>
    <v-main class="background">
      <v-container fluid>
        <template v-if="existWorkflowId">
          <info-card :workflow-id="workflowId" class="mt-4 mx-auto"></info-card>
          <run-card class="mt-8 mx-auto mb-4"></run-card>
        </template>
        <template v-else>Does not exist.</template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { ComponentOptions } from 'vue/types'
import { Service } from '@/types'
import AppBar from '@/components/AppBar.vue'
import InfoCard from '@/components/workflow/InfoCard.vue'
import RunCard from '@/components/workflow/RunCard.vue'
import Vue from 'vue'

export default Vue.extend({
  components: {
    AppBar,
    InfoCard,
    RunCard
  },
  computed: {
    existWorkflowId(): boolean {
      return this.$store.getters['workflow/existWorkflowId'](
        this.$route.params.id
      )
    },
    workflowId(): string {
      return this.$route.params.id
    }
  }
})
</script>
