<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <workflow-icon :size="36" :top-margin="false" :wf-type="workflow.type" />
      <div class="card-header" v-text="workflow.name" />
      <v-tooltip v-if="workflow.preRegistered" top>
        <template #activator="{ on }">
          <v-icon
            :color="$colors.indigo.darken1"
            class="ml-2 mt-1"
            v-on="on"
            v-text="'mdi-account-check-outline'"
          />
        </template>
        <span v-text="'Pre-registered workflow'" />
      </v-tooltip>
    </div>

    <v-data-table
      :headers="workflowInfoHeaders"
      :items="workflowInfoContents"
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
        <a
          v-if="item.key === 'URL' && validUrl(item.value)"
          :href="item.value"
          v-text="item.value"
        />
        <span v-else v-text="item.value" />
      </template>
    </v-data-table>

    <div class="d-flex ml-12 mr-3 mt-2 pb-6">
      <codemirror
        :options="{
          lineNumbers: true,
          mode: codeMirrorMode(workflow.content),
          tabSize: 2,
          readOnly: 'nocursor',
        }"
        :style="{
          outline: `solid 1px ${$colors.grey.lighten1}`,
          maxWidth: '97%',
        }"
        :value="workflow.content"
        class="elevation-2 content-viewer flex-grow-1"
      />
      <div class="d-flex flex-column ml-3">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-icon
              :color="$colors.grey.darken1"
              @click.stop="downloadWorkflowContent"
              v-on="on"
              v-text="'mdi-download'"
            />
          </template>
          <span v-text="'Download the workflow document'" />
        </v-tooltip>
        <v-tooltip v-model="copyTooltip" top>
          <template #activator="{ on }">
            <div class="mt-2" v-on="on">
              <v-icon
                :color="$colors.grey.darken1"
                @click.stop="copyWorkflowContent"
                v-text="'mdi-clipboard-outline'"
              />
            </div>
          </template>
          <span v-text="copied ? 'Copied!!' : 'Copy the workflow document'" />
        </v-tooltip>
      </div>
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
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import WorkflowIcon from '@/components/WorkflowIcon.vue'

type Data = {
  workflowInfoHeaders: DataTableHeader[]
  copyTooltip: boolean
  copied: boolean
}

type Methods = {
  validUrl: (val: string) => ReturnType<typeof validUrl>
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
  copyWorkflowContent: () => void
  downloadWorkflowContent: () => void
}

type Computed = {
  service: Service
  workflow: Workflow
  workflowInfoContents: {
    key: string
    value: string
  }[]
}

type Props = {
  workflowId: string
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
    WorkflowIcon,
  },

  props: {
    workflowId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      workflowInfoHeaders: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' },
      ],
      copyTooltip: false,
      copied: false,
    }
  },

  computed: {
    workflow() {
      return this.$store.getters['workflows/workflow'](this.workflowId)
    },

    service() {
      return this.$store.getters['services/service'](this.workflow.serviceId)
    },

    workflowInfoContents() {
      return [
        { key: 'URL', value: this.workflow.url },
        {
          key: this.workflow.preRegistered ? 'Updated Date' : 'Added Date',
          value: this.workflow.preRegistered
            ? this.$dayjs(this.workflow.updatedDate)
                .local()
                .format('YYYY-MM-DD HH:mm:ss')
            : this.$dayjs(this.workflow.addedDate)
                .local()
                .format('YYYY-MM-DD HH:mm:ss'),
        },
      ]
    },
  },

  methods: {
    validUrl(val) {
      return validUrl(val)
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    copyWorkflowContent() {
      this.copyTooltip = false
      this.$copyText(this.workflow.content)
      setTimeout(() => {
        this.copyTooltip = true
        this.copied = true
        setTimeout(() => {
          this.copyTooltip = false
          setTimeout(() => {
            this.copied = false
          }, 300)
        }, 1000)
      }, 300)
    },

    downloadWorkflowContent() {
      const blob = new Blob([this.workflow.content], { type: 'text/plane' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = this.workflow.url.split('/').slice(-1)[0]
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
  height: 250px !important;
  font-size: 0.9rem !important;
}
.content-viewer >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
.info-table >>> td:nth-child(1) {
  width: 270px;
  font-weight: 500;
}
.info-table >>> tr:not(:last-child) td {
  border-bottom: none !important;
}
</style>
