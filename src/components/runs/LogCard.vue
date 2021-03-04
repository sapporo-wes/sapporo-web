<template>
  <v-card elevation="8" max-width="1200">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="'Run Log'" />
      <v-spacer />
      <v-btn
        :color="$colors.grey.darken2"
        outlined
        class="mr-4"
        @click.stop="downloadRunLog"
      >
        <v-icon class="mr-2" v-text="'mdi-download'" />
        <span v-text="'Download Run Log'" />
      </v-btn>
    </div>
    <v-data-table
      :headers="logInfoHeaders"
      :items="logInfoContents"
      calculate-widths
      class="mx-12 pt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      hide-default-footer
      hide-default-header
      item-key="key"
    />

    <div class="mx-12">
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
          <v-list
            v-if="
              tabItem.key === 'Outputs' &&
              JSON.parse(tabItem.value) !== null &&
              JSON.parse(tabItem.value).length !== 0
            "
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
                v-for="(file, ind) in JSON.parse(tabItem.value)"
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
import { AttachedFile } from '@/types/WES'
import { codemirror } from 'vue-codemirror'
import { codeMirrorMode } from '@/utils'
import { DataTableHeader } from 'vuetify/types'
import { Run } from '@/store/runs'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'

type Data = {
  logInfoHeaders: DataTableHeader[]
  tab: number | null
}

type Methods = {
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
  downloadOutputFile: (file: AttachedFile) => void
  downloadRunLog: () => Promise<void>
}

type Computed = {
  run: Run
  logInfoContents: {
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
      logInfoHeaders: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' },
      ],
      tab: null,
    }
  },

  computed: {
    run(): Run {
      return this.$store.getters['runs/run'](this.runId)
    },

    logInfoContents() {
      return [
        {
          key: 'Start Time',
          value: this.run.runLog.run_log.start_time
            ? this.$dayjs
                .utc(this.run.runLog.run_log.start_time)
                .local()
                .format('YYYY-MM-DD HH:mm:ss')
            : '',
        },
        {
          key: 'End Time',
          value: this.run.runLog.run_log.end_time
            ? this.$dayjs
                .utc(this.run.runLog.run_log.end_time)
                .local()
                .format('YYYY-MM-DD HH:mm:ss')
            : '',
        },
        {
          key: 'Exit Code',
          value: `${
            Number.isInteger(this.run.runLog.run_log.exit_code)
              ? this.run.runLog.run_log.exit_code
              : ''
          }`,
        },
      ]
    },

    tabItems() {
      return [
        {
          key: 'Command',
          value: this.run.runLog.run_log.cmd,
        },
        {
          key: 'Stdout',
          value: this.run.runLog.run_log.stdout,
        },
        {
          key: 'Stderr',
          value: this.run.runLog.run_log.stderr,
        },
        {
          key: 'Outputs',
          value: JSON.stringify(this.run.runLog.outputs, null, 2),
        },
      ]
    },
  },

  methods: {
    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    downloadOutputFile(file: AttachedFile) {
      const link = document.createElement('a')
      link.download = file.file_name.split('/').slice(-1)[0]
      link.href = file.file_url
      link.click()
      link.remove()
    },

    async downloadRunLog() {
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
