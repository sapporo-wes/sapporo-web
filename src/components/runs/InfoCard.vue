<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-tooltip top>
        <template #activator="{ on }">
          <img
            v-if="workflow.type.toLowerCase() === 'cwl'"
            src="~/assets/icon/cwl-icon.png"
            height="36"
            class="mr-2"
            v-on="on"
          />
          <img
            v-else-if="workflow.type.toLowerCase() === 'wdl'"
            src="~/assets/icon/wdl-icon.png"
            height="36"
            class="mr-2"
            v-on="on"
          />
          <img
            v-else-if="workflow.type.toLowerCase() === 'nextflow'"
            src="~/assets/icon/nextflow-icon.png"
            height="36"
            class="mr-4"
            v-on="on"
          />
          <img
            v-else-if="workflow.type.toLowerCase() === 'snakemake'"
            src="~/assets/icon/snakemake-icon.png"
            height="36"
            class="mr-4"
            v-on="on"
          />
          <v-icon
            v-else
            left
            color="black"
            v-on="on"
            v-text="'mdi-graph-outline'"
          />
        </template>
        <span v-text="`${workflow.type} ${workflow.version}`" />
      </v-tooltip>
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
        :disabled="!cancelButton"
        @click.stop="cancelRun"
      >
        <v-icon left v-text="'mdi-close'" />
        <span v-text="'Cancel Run'" />
      </v-btn>
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            :color="$colors.grey.darken2"
            outlined
            small
            @click.stop="reloadRunState"
            v-on="on"
          >
            <v-icon v-text="'mdi-reload'" />
          </v-btn>
        </template>
        <span v-text="'Reload run status'" />
      </v-tooltip>
    </div>

    <v-data-table
      :headers="runInfoHeaders"
      :items="runInfoContents"
      calculate-widths
      class="mx-12 mt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      hide-default-footer
      hide-default-header
      item-key="key"
    >
      <template #[`item.value`]="{ item }">
        <div v-if="item.key === 'Run ID'" class="d-flex align-center">
          <span v-text="item.value" />
          <v-tooltip top :value="tooltip">
            <template #activator="on">
              <v-icon
                right
                v-on="on"
                @click.stop="copyTooltip"
                v-text="'mdi-clipboard-outline'"
              />
            </template>
            <span v-text="'Copied!!'" />
          </v-tooltip>
        </div>
        <a
          v-else-if="item.key === 'Workflow URL' && validUrl(item.value)"
          :href="item.value"
          v-text="item.value"
        />
        <span v-else v-text="item.value" />
      </template>
    </v-data-table>

    <div class="ml-12 mr-11">
      <v-tabs v-model="tab" vertical height="332">
        <v-tab
          v-for="tabItem in tabItems"
          :key="tabItem.key"
          :style="{
            textTransform: 'none',
            justifyContent: 'start',
            letterSpacing: 'normal',
            maxWidth: '210px',
            minWidth: '210px',
          }"
          v-text="tabItem.key"
        />
        <v-tab-item v-for="tabItem in tabItems" :key="tabItem.key">
          <codemirror
            :options="{
              lineNumbers: true,
              mode: codeMirrorMode(tabItem.value),
              readOnly: 'nocursor',
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
import { DataTableHeader } from 'vuetify/types'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { codeMirrorMode, validUrl } from '@/utils'
import { Run } from '@/store/runs'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'

type Data = {
  runInfoHeaders: DataTableHeader[]
  tab: number | null
  tooltip: boolean
  cancelButton: boolean
}

type Methods = {
  reloadRunState: () => Promise<void>
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
  validUrl: (val: string) => ReturnType<typeof validUrl>
  cancelRun: () => Promise<void>
  copyTooltip: () => void
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
      tooltip: false,
      cancelButton: true,
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
        { key: 'Run ID', value: this.runId },
        { key: 'Workflow URL', value: this.run.runLog.request.workflow_url },
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
        this.cancelButton = false
        await this.$store.dispatch('runs/cancelRun', this.runId)
        await this.$store.dispatch('runs/updateRun', this.runId)
        this.cancelButton = true
      }
    },

    copyTooltip() {
      this.$copyText(this.runId)
      this.tooltip = true
      setTimeout(() => {
        this.tooltip = false
      }, 1500)
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
.info-table >>> tr:not(:last-child) td {
  border-bottom: none !important;
}
</style>
