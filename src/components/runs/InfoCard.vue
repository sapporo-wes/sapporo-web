<template>
  <v-card elevation="8" max-width="1200">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="run.name" />
      <v-spacer />
      <v-chip
        :color="$store.getters['runs/stateColor'](run.id)"
        class="mr-4"
        text-color="white"
        v-text="run.state"
      />
      <v-btn
        v-if="
          ['QUEUED', 'INITIALIZING', 'RUNNING', 'PAUSED'].includes(run.state)
        "
        outlined
        color="error"
        class="mr-4"
        @click.stop="cancelRun"
      >
        <v-icon class="mr-2">mdi-close</v-icon>
        Cancel Run
      </v-btn>
      <v-btn
        :color="$colors.grey.darken2"
        outlined
        small
        @click.stop="reloadRunState"
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </div>

    <v-data-table
      :headers="runInfoHeaders"
      :items="runInfoContents"
      calculate-widths
      class="mx-12 pt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      hide-default-footer
      hide-default-header
      item-key="key"
    >
      <template #[`item.value`]="{ item }">
        <nuxt-link
          v-if="item.key === 'Service'"
          :to="{ path: '/services', query: { serviceId: service.id } }"
          v-text="service.name"
        />
        <nuxt-link
          v-else-if="item.key === 'Workflow'"
          :to="{ path: '/workflows', query: { workflowId: workflow.id } }"
          v-text="workflow.name"
        />
        <a
          v-else-if="item.key === 'Workflow URL' && validUrl(item.value)"
          :href="item.value"
          >{{ item.value }}</a
        >
        <div v-else v-text="item.value" />
      </template>
    </v-data-table>

    <div class="mx-12">
      <v-tabs v-model="tab" vertical height="332">
        <v-tab
          v-for="tabItem in tabItems"
          :key="tabItem.key"
          :style="{
            textTransform: 'none',
            justifyContent: 'start',
            letterSpacing: 'normal',
          }"
          v-text="tabItem.key"
        />
        <v-tab-item v-for="tabItem in tabItems" :key="tabItem.key">
          <codemirror
            :options="{
              lineNumbers: true,
              mode: codeMirrorMode(tabItem.value),
              readOnly: true,
              tabSize: 2,
            }"
            :style="{
              outline: `solid 1px ${$colors.grey.lighten1}`,
            }"
            :value="tabItem.value"
            class="ml-6 mr-1 mt-2 mb-6 elevation-2 content-viewer"
          />
        </v-tab-item>
      </v-tabs>
    </div>
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import { codemirror } from 'vue-codemirror'
import { codeMirrorMode, validUrl } from '@/utils'
import { DataTableHeader } from 'vuetify/types'
import { Run } from '@/store/runs'
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Workflow } from '@/store/workflows'
import Vue from 'vue'

type Data = {
  runInfoHeaders: DataTableHeader[]
  tab: number | null
}

type Methods = {
  reloadRunState: () => Promise<void>
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
  validUrl: (val: string) => ReturnType<typeof validUrl>
  cancelRun: () => Promise<void>
}

type Computed = {
  service: Service
  workflow: Workflow
  run: Run
  runInfoContents: {
    key: string
    value: string
  }[]
  tabItems: {
    key: string
    value: string
  }[]
}

type Props = {
  runId: string
}

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  components: {
    codemirror,
  },

  props: {
    runId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      runInfoHeaders: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' },
      ],
      tab: 3,
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.run.serviceId)
    },

    workflow(): Workflow {
      return this.$store.getters['workflows/workflow'](this.run.workflowId)
    },

    run(): Run {
      return this.$store.getters['runs/run'](this.runId)
    },

    runInfoContents() {
      return [
        { key: 'Service', value: '' },
        { key: 'Workflow', value: '' },
        { key: 'Workflow URL', value: this.run.runLog.request.workflow_url },
        {
          key: 'Workflow Type Version',
          value: `${this.run.runLog.request.workflow_type} ${this.run.runLog.request.workflow_type_version}`,
        },
        {
          key: 'Workflow Engine',
          value: `${
            this.run.runLog.request.workflow_engine_name
          } ${this.$store.getters['services/workflowEngineVersion']({
            serviceId: this.service.id,
            workflowEngine: this.run.runLog.request.workflow_engine_name,
          })}`,
        },
      ]
    },

    tabItems() {
      return [
        {
          key: 'Workflow Engine Parameters',
          value: this.run.runLog.request.workflow_engine_parameters,
        },
        { key: 'Tags', value: this.run.runLog.request.tags },
        {
          key: 'Workflow Attachment',
          value: JSON.stringify(
            this.run.runLog.request.workflow_attachment,
            null,
            2
          ),
        },
        {
          key: 'Workflow Prameters',
          value: this.run.runLog.request.workflow_params,
        },
      ]
    },
  },

  methods: {
    async reloadRunState() {
      await this.$store.dispatch('runs/updateRun', this.runId)
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    validUrl(val) {
      return validUrl(val)
    },

    async cancelRun() {
      if (
        ['QUEUED', 'INITIALIZING', 'RUNNING', 'PAUSED'].includes(this.run.state)
      ) {
        await this.$store.dispatch('runs/cancelRun', this.runId)
        await this.$store.dispatch('runs/updateRun', this.runId)
      }
    },
  },
}

export default Vue.extend(options)
</script>

<style scoped>
.content-viewer >>> .CodeMirror {
  height: 300px !important;
  font-size: 0.9rem !important;
}
.content-viewer >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
.info-table >>> td:nth-child(1) {
  width: 220px;
  font-weight: 500;
}
</style>
