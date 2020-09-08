<template>
  <v-card elevation="8" max-width="960">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="run.name" />
      <v-spacer />
      <v-chip
        :color="getRunStateColor(run.state)"
        class="mr-4"
        text-color="white"
        v-text="run.state"
      />
      <v-btn
        :color="$colors.grey.darken2"
        @click="reloadRunState"
        outlined
        small
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </div>
    <v-data-table
      :headers="runInfoHeader"
      :items="runInfoContent"
      class="mx-12 my-2"
      disable-filtering
      disable-pagination
      disable-sort
      hide-default-footer
      hide-default-header
      item-key="key"
    >
      <template v-slot:[`item.value`]="{ item }">
        <nuxt-link
          :to="`/service/${service.id}`"
          class="text-decoration-none"
          v-text="service.name"
          v-if="item.key === 'Service'"
        />
        <nuxt-link
          :to="`/workflow/${workflow.id}`"
          class="text-decoration-none"
          v-text="workflow.name"
          v-else-if="item.key === 'Workflow'"
        />
        <div v-text="item.value" v-else />
      </template>
    </v-data-table>
    <div class="d-flex flex-column">
      <div
        :style="{ fontSize: '1.2rem' }"
        class="px-10 pb-4"
        v-text="'Workflow Parameters'"
      />
      <codemirror
        ref="cmEditor"
        :value="
          JSON.stringify(
            JSON.parse(run.runLog.request.workflow_params),
            null,
            2
          )
        "
        :options="{
          collapseIdentical: false,
          lineNumbers: true,
          mode: 'text/javascript',
          readOnly: 'nocursor',
          theme: 'base16-light'
        }"
        class="mx-12 elevation-2"
      />
      <div class="pt-6" />
    </div>
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/theme/base16-light.css'
import { codemirror } from 'vue-codemirror'
import { Service, Workflow, Run } from '@/types'
import Vue from 'vue'

export default Vue.extend({
  components: {
    codemirror
  },
  props: {
    runId: String
  },
  data() {
    return {
      runInfoHeader: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' }
      ]
    }
  },
  computed: {
    run(): Run {
      return this.$store.getters['run/runFilteredById'](this.runId)
    },
    service(): Service {
      const run = this.$store.getters['run/runFilteredById'](this.runId)
      return this.$store.getters['service/serviceFilteredById'](run.serviceId)
    },
    workflow(): Workflow {
      const run = this.$store.getters['run/runFilteredById'](this.runId)
      return this.$store.getters['workflow/workflowFilteredById'](
        run.workflowId
      )
    },
    runInfoContent() {
      const run = this.$store.getters['run/runFilteredById'](this.runId)
      return [
        { key: 'Service', value: '' },
        { key: 'Workflow', value: '' },
        {
          key: 'Workflow Type Version',
          value: `${run.runLog.request.workflow_type} ${run.runLog.request.workflow_type_version}`
        },
        {
          key: 'Workflow Engine',
          value: run.runLog.request.workflow_engine_name
        },
        {
          key: 'Workflow Engine Parameters',
          value: run.runLog.request.workflow_engine_parameters
        },
        {
          key: 'Workflow Attachment',
          value: run.runLog.request.workflow_attachment
        },
        { key: 'Tags', value: run.runLog.request.tags }
      ]
    }
  },
  methods: {
    getRunStateColor(runState: string): string {
      if (runState === 'UNKNOWN') return this.$colors.grey.darken1
      else if (runState === 'QUEUED') return this.$colors.lightBlue.darken1
      else if (runState === 'INITIALIZING')
        return this.$colors.lightBlue.darken1
      else if (runState === 'RUNNING') return this.$colors.indigo.darken1
      else if (runState === 'PAUSED') return this.$colors.lightBlue.darken1
      else if (runState === 'COMPLETE') return this.$colors.green.darken1
      else if (runState === 'EXECUTOR_ERROR') return this.$colors.red.darken1
      else if (runState === 'SYSTEM_ERROR') return this.$colors.red.darken1
      else if (runState === 'CANCELED') return this.$colors.amber.darken1
      else if (runState === 'CANCELING') return this.$colors.amber.darken1
      else return this.$colors.grey.darken1
    },
    async reloadRunState() {
      await this.$store.dispatch('run/updateRun', this.runId)
    }
  }
})
</script>

<style>
.CodeMirror {
  height: 400px !important;
  font-size: 0.9rem !important;
}
.CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
</style>
