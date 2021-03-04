<template>
  <v-card elevation="8" max-width="1200">
    <div class="card-header px-6 pt-4" v-text="'Run Log'" />
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
          <codemirror
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
