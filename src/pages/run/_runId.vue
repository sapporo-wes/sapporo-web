<template>
  <div>
    <v-card> </v-card>
    {{ this.run }}
    {{ this.service }}
    {{ this.workflow }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Context } from '@nuxt/types'
import { Service, Workflow, Run } from '@/types'

interface MyWindow extends Window {
  onNuxtReady(obj: object): void
}
declare let window: MyWindow

export default Vue.extend({
  async fetch({ store, params }: Context) {
    await window.onNuxtReady(async () => {
      await store.dispatch('run/updateRun', params.runId)
    })
  },
  computed: {
    runId(): string {
      return this.$route.params.runId
    },
    service(): Service {
      return this.$store.getters['service/serviceFilteredByRunId'](
        this.$route.params.runId
      )
    },
    workflow(): Workflow {
      return this.$store.getters['workflow/workflowFilteredByRunId'](
        this.$route.params.runId
      )
    },
    run(): Run {
      return this.$store.getters['run/runFilteredById'](
        this.$route.params.runId
      )
    }
  }
})
</script>
