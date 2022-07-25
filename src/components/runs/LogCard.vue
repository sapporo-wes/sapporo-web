<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-file-chart-outline'" />
      <div class="card-header" v-text="'Run Log'" />
      <v-spacer />
      <v-btn
        class="mr-6"
        :color="$colors.grey.darken2"
        outlined
        @click.stop="downloadRunLog"
      >
        <v-icon left v-text="'mdi-download'" />
        <span v-text="'Download Run Log'" />
      </v-btn>
    </div>
    <v-data-table
      calculate-widths
      class="mx-12 mt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      :headers="logInfoHeaders"
      hide-default-footer
      hide-default-header
      item-key="key"
      :items="logInfoContents"
    />

    <div class="ml-12 mr-11">
      <v-tabs v-model="tab" height="332" vertical>
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
          <v-list
            v-if="isSapporo && tabItem.key === 'Outputs' && outputs.length > 0"
            class="ml-6 mt-2 mb-6 mr-1"
            dense
            elevation="2"
            flat
            max-height="300"
            rounded
            :style="{
              outline: `solid 1px ${$colors.grey.lighten1}`,
              overflowY: 'auto',
            }"
          >
            <v-list-item-group color="primary" disable>
              <v-list-item
                v-for="(file, ind) in outputs"
                :key="ind"
                @click="downloadOutputFile(file)"
              >
                <v-list-item-icon>
                  <v-icon v-text="'mdi-download'" />
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="file.file_name" />
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <codemirror
            v-else
            class="ml-6 mr-1 mt-2 mb-6 elevation-2 content-viewer"
            :options="{
              lineNumbers: true,
              mode: codeMirrorMode(tabItem.value),
              readOnly: true,
              lineWrapping: tabItem.key === 'Command',
              tabSize: 2,
            }"
            :style="{
              outline: `solid 1px ${$colors.grey.lighten1}`,
            }"
            :value="tabItem.value"
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
import { defineComponent } from 'vue'
import { AttachedFile } from '@/types/WES'
import { codeMirrorMode, formatResponse, formatTime } from '@/utils'
import { Run } from '@/store/runs'
import { Service } from '@/store/services'
import { WesVersions } from '@/utils/WESRequest'

export default defineComponent({
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
      logInfoHeaders: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' },
      ] as DataTableHeader[],
      tab: null as number | null,
      outputs: [] as Array<unknown>,
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.run.serviceId)
    },

    wesVersion(): WesVersions {
      return this.$store.getters['services/wesVersion'](this.run.serviceId)
    },

    isSapporo(): boolean {
      return (
        this.wesVersion === 'sapporo-1.0.0' ||
        this.wesVersion === 'sapporo-1.0.1'
      )
    },

    run(): Run {
      return this.$store.getters['runs/run'](this.runId)
    },

    logInfoContents(): { key: string; value: string }[] {
      let startTime = this.run.runLog.run_log?.start_time
      if (
        !startTime &&
        this.run.runLog.run_log &&
        'task_started' in this.run.runLog.run_log
      ) {
        // for cwl-wes
        // eslint-disable-next-line camelcase
        startTime = (this.run.runLog.run_log as { task_started: string })
          .task_started
      }
      let endTime = this.run.runLog.run_log?.end_time
      if (
        !endTime &&
        this.run.runLog.run_log &&
        'task_finished' in this.run.runLog.run_log
      ) {
        // for cwl-wes
        // eslint-disable-next-line camelcase
        endTime = (this.run.runLog.run_log as { task_finished: string })
          .task_finished
      }
      const startTimeStr = formatTime(this.$dayjs, formatResponse(startTime))
      const endTimeStr = formatTime(this.$dayjs, formatResponse(endTime))

      const exitCode = formatResponse(this.run.runLog.run_log?.exit_code)

      const contents = [
        {
          key: 'Start Time',
          value: startTimeStr,
        },
        {
          key: 'End Time',
          value: endTimeStr,
        },
      ]
      if (Number.isInteger(exitCode)) {
        contents.push({
          key: 'Exit Code',
          value: exitCode,
        })
      }

      return contents
    },

    tabItems(): { key: string; value: string }[] {
      let command: unknown = this.run.runLog.run_log?.cmd
      if (
        !command &&
        this.run.runLog.run_log &&
        'command' in this.run.runLog.run_log
      ) {
        // for cwl-wes
        // eslint-disable-next-line camelcase
        command = (this.run.runLog.run_log as { command: unknown }).command
      }
      const commandStr = formatResponse(command)
      const stdout = formatResponse(this.run.runLog.run_log?.stdout)
      const stderr = formatResponse(this.run.runLog.run_log?.stderr)
      const taskLogs = formatResponse(this.run.runLog.task_logs)
      const outputs = formatResponse(this.run.runLog.outputs)
      try {
        const outputsArr = JSON.parse(outputs)
        if (this.isSapporo && Array.isArray(outputsArr)) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.outputs = outputsArr
        }
      } catch (_) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.outputs = []
      }

      return [
        {
          key: 'Command',
          value: commandStr,
        },
        {
          key: 'Stdout',
          value: stdout,
        },
        {
          key: 'Stderr',
          value: stderr,
        },
        {
          key: 'Task Logs',
          value: taskLogs,
        },
        {
          key: 'Outputs',
          value: outputs,
        },
      ]
    },
  },

  methods: {
    codeMirrorMode(content: string): ReturnType<typeof codeMirrorMode> {
      return codeMirrorMode(content)
    },

    downloadOutputFile(file: AttachedFile): void {
      const link = document.createElement('a')
      link.download = file.file_name.split('/').slice(-1)[0]
      link.href = file.file_url
      link.click()
      link.remove()
    },

    async downloadRunLog(): Promise<void> {
      await this.$store.dispatch('runs/updateRun', this.run.id)
      const blob = new Blob([JSON.stringify(this.run.runLog, null, 2)], {
        type: 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `${this.run.name}.json`
      link.href = url
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
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
