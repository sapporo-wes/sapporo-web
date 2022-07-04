<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <workflow-icon :size="36" :top-margin="false" :wf-type="workflow.type" />
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
import { defineComponent } from 'vue'
import { DataTableHeader } from 'vuetify/types'
import { AttachedFile, RunLogSpr } from '@/types/WES'
import { codeMirrorMode, validUrl, formatResponse } from '@/utils'
import { Run } from '@/store/runs'
import { Service } from '@/store/services'
import { WesVersions } from '@/utils/WESRequest'
import { Workflow } from '@/store/workflows'
import WorkflowIcon from '@/components/WorkflowIcon.vue'

export default defineComponent({
  components: {
    codemirror,
    WorkflowIcon,
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
      ] as DataTableHeader[],
      tab: 2 as number | null,
      tooltip: false,
      cancelButton: true,
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.run.serviceId)
    },

    wesVersion(): WesVersions {
      return this.$store.getters['services/wesVersion'](this.run.serviceId)
    },

    workflow(): Workflow {
      return this.$store.getters['workflows/workflow'](this.run.workflowId)
    },

    run(): Run {
      return this.$store.getters['runs/run'](this.runId)
    },

    runInfoContents(): { key: string; value: string }[] {
      const wfUrl = formatResponse(this.run.runLog?.request?.workflow_url)
      let wfEngineName = ''
      if (this.wesVersion !== '1.0.0') {
        wfEngineName = formatResponse(
          (this.run.runLog as RunLogSpr).request?.workflow_engine_name
        )
      }

      const contents = [
        { key: 'Run ID', value: this.runId },
        { key: 'Workflow URL', value: wfUrl },
      ]
      if (this.wesVersion !== '1.0.0' && wfEngineName) {
        const wfEngineVersion = this.$store.getters[
          'services/workflowEngineVersion'
        ]({
          serviceId: this.service.id,
          workflowEngine: wfEngineName,
        })
        contents.push({
          key: 'Workflow Engine',
          value: `${wfEngineName} ${wfEngineVersion}`,
        })
      }
      return contents
    },

    tabItems(): { key: string; value: string }[] {
      const wfEngineParams = formatResponse(
        this.run.runLog?.request?.workflow_engine_parameters
      )
      const tags = formatResponse(this.run.runLog?.request?.tags)
      const wfParams = formatResponse(this.run.runLog?.request?.workflow_params)
      let wfAttachment: AttachedFile[] = []
      if (
        this.run.runLog?.request &&
        'workflow_attachment' in this.run.runLog?.request
      ) {
        wfAttachment = this.run.runLog?.request
          .workflow_attachment as unknown as AttachedFile[]
      }
      const wfAttachmentStr = formatResponse(wfAttachment)

      const items = [
        {
          key: 'Workflow Engine Parameters',
          value: wfEngineParams,
        },
        {
          key: 'Tags',
          value: tags,
        },
        {
          key: 'Workflow Parameters',
          value: wfParams,
        },
      ]
      if (this.wesVersion !== '1.0.0') {
        this.tab = 3
        items.splice(2, 0, {
          key: 'Workflow Attachment',
          value: wfAttachmentStr,
        })
      }
      return items
    },
  },

  methods: {
    async reloadRunState(): Promise<void> {
      await this.$store.dispatch('runs/updateRun', this.runId)
    },

    codeMirrorMode(content: string): ReturnType<typeof codeMirrorMode> {
      return codeMirrorMode(content)
    },

    validUrl(val: string): ReturnType<typeof validUrl> {
      return validUrl(val)
    },

    async cancelRun(): Promise<void> {
      if (
        ['QUEUED', 'INITIALIZING', 'RUNNING', 'PAUSED'].includes(this.run.state)
      ) {
        this.cancelButton = false
        await this.$store.dispatch('runs/cancelRun', this.runId)
        await this.$store.dispatch('runs/updateRun', this.runId)
        this.cancelButton = true
      }
    },

    copyTooltip(): void {
      this.$copyText(this.runId)
      this.tooltip = true
      setTimeout(() => {
        this.tooltip = false
      }, 1500)
    },
  },
})
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
