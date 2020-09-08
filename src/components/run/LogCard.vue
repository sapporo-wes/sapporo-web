<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header px-6 pt-4" v-text="'Log'" />
    <v-data-table
      :headers="logInfoHeader"
      :items="logInfoContent"
      class="mx-12 my-2"
      disable-filtering
      disable-pagination
      disable-sort
      hide-default-footer
      hide-default-header
      item-key="key"
    />
    <div class="d-flex flex-column">
      <div
        :style="{ fontSize: '1.2rem' }"
        class="px-10 pb-4"
        v-text="'Stdout'"
      />
      <codemirror
        ref="cmEditor"
        :value="run.runLog.run_log.stdout"
        :options="{
          collapseIdentical: false,
          lineNumbers: true,
          readOnly: 'nocursor',
          theme: 'base16-light'
        }"
        class="mx-12 elevation-2"
      />
      <div class="pt-6" />
    </div>
    <div class="d-flex flex-column">
      <div
        :style="{ fontSize: '1.2rem' }"
        class="px-10 pb-4"
        v-text="'Stderr'"
      />
      <codemirror
        ref="cmEditor"
        :value="run.runLog.run_log.stderr"
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
      logInfoHeader: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' }
      ]
    }
  },
  computed: {
    run(): Run {
      return this.$store.getters['run/runFilteredById'](this.runId)
    },
    logInfoContent() {
      const run = this.$store.getters['run/runFilteredById'](this.runId)
      return [
        { key: 'Command', value: run.runLog.run_log.cmd },
        { key: 'Start Time', value: run.runLog.run_log.start_time },
        {
          key: 'End Time',
          value: run.runLog.run_log.end_time
        },
        {
          key: 'Exit Code',
          value: run.runLog.run_log.exit_code
        }
      ]
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
