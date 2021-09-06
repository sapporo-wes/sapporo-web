<template>
  <v-card elevation="8" max-width="1200">
    <div class="card-header pl-6 pt-4" v-text="'Compose Run'" />
    <div class="px-12 py-4">
      <div class="field-header" v-text="'Run Name'" />
      <v-text-field
        v-model="runName"
        :error-messages="runNameError"
        class="pt-0 px-4 pb-4"
        clearable
        hint="Required"
        persistent-hint
        single-line
      />
      <div class="field-header" v-text="'Workflow Engine'" />
      <v-select
        v-model="wfEngine"
        :error-messages="wfEngineError"
        :items="wfEngines"
        class="pt-0 px-4 pb-4"
        clearable
        hint="Required"
        persistent-hint
        single-line
      />
      <div class="mt-4 field-header" v-text="'Workflow Engine Parameters'" />
      <codemirror
        v-model="wfEngineParams"
        :options="{
          lineNumbers: true,
          mode: codeMirrorMode(wfEngineParams),
          tabSize: 2,
        }"
        :style="{
          outline: `solid 1px ${
            !!wfEngineParamsError
              ? $vuetify.theme.themes.light.error
              : $colors.grey.lighten1
          }`,
        }"
        class="mx-4 mt-4 mb-2 elevation-2 input-field-small"
      />
      <div
        class="mx-4 v-messages theme--light"
        :class="{ 'error--text': !!wfEngineParamsError }"
        v-text="
          !!wfEngineParamsError
            ? wfEngineParamsError
            : 'Optional: JSON or YAML object, type or drag-and-drop'
        "
      />
      <div class="mt-4 field-header" v-text="'Tags'" />
      <codemirror
        v-model="tags"
        :options="{
          lineNumbers: true,
          mode: codeMirrorMode(tags),
          tabSize: 2,
        }"
        :style="{
          outline: `solid 1px ${
            !!tagsError
              ? $vuetify.theme.themes.light.error
              : $colors.grey.lighten1
          }`,
        }"
        class="mx-4 mt-4 mb-2 elevation-2 input-field-small"
      />
      <div
        class="mx-4 v-messages theme--light"
        :class="{ 'error--text': !!tagsError }"
        v-text="
          !!tagsError
            ? tagsError
            : 'Optional: JSON or YAML object, type or drag-and-drop'
        "
      />
      <div class="mt-4 mb-2 field-header" v-text="'Workflow Attachment'" />
      <div
        class="ml-6"
        v-text="
          serviceWorkflowAttachment
            ? 'Workflow Attachment as JSON/YAML'
            : 'Workflow Attachment as JSON/YAML (read-only)'
        "
      />
      <codemirror
        v-model="wfAttachmentText"
        :options="{
          lineNumbers: true,
          mode: codeMirrorMode(wfAttachmentText),
          tabSize: 2,
          readOnly: !serviceWorkflowAttachment,
        }"
        :style="{
          outline: `solid 1px ${
            !!wfAttachmentTextError
              ? $vuetify.theme.themes.light.error
              : $colors.grey.lighten1
          }`,
        }"
        class="ml-14 mr-4 mt-4 mb-4 elevation-2 input-field-middle"
      />
      <div
        v-if="serviceWorkflowAttachment"
        class="ml-14 v-messages theme--light"
        :class="{ 'error--text': !!wfAttachmentTextError }"
        v-text="
          !!wfAttachmentTextError
            ? wfAttachmentTextError
            : 'Optional: JSON or YAML object, type or drag-and-drop'
        "
      />
      <div class="mt-4 ml-6 mb-2" v-text="'Workflow Attachment as File'" />
      <div v-if="serviceWorkflowAttachment" class="d-flex flex-column mx-4">
        <div
          v-for="ind in workflowAttachment.length"
          :key="ind"
          class="d-flex ml-8"
        >
          <v-file-input
            v-model="workflowAttachment[ind - 1]"
            :style="{
              maxWidth: '50%',
              minWidth: '50%',
            }"
            class="mr-8 pt-0"
            clearable
            label="File"
            show-size
            single-line
            @change="updateWorkflowAttachment($event, ind - 1)"
          />
          <v-text-field
            v-model="fileNames[ind - 1]"
            class="pt-0"
            clearable
            label="File name"
            single-line
            @change="updateFileName($event, ind - 1)"
          />
        </div>
        <div
          class="ml-10 v-messages theme--light"
          v-text="'Optional: multiple files'"
        />
        <div class="d-flex justify-end">
          <v-btn
            class="mr-4"
            :color="$colors.grey.darken2"
            outlined
            width="160"
            @click.stop="incrementWorkflowAttachment"
          >
            <v-icon class="mr-2" v-text="'mdi-text-box-plus-outline'" />
            <span v-text="'Add'" />
          </v-btn>
          <v-btn
            :color="$colors.grey.darken2"
            outlined
            width="160"
            @click.stop="decrementWorkflowAttachment"
          >
            <v-icon class="mr-2" v-text="'mdi-text-box-minus-outline'" />
            <span v-text="'Remove'" />
          </v-btn>
        </div>
      </div>
      <div
        v-if="!serviceWorkflowAttachment"
        class="ml-14 mb-4"
        :style="{
          color: $vuetify.theme.themes.light.error,
          textDecorationLine: 'underline',
        }"
        v-text="'Worklfow attachment is not allowed in this service.'"
      />
      <div class="mt-4 field-header" v-text="'Workflow Parameters'" />
      <codemirror
        v-model="wfParams"
        :options="{
          lineNumbers: true,
          mode: codeMirrorMode(wfParams),
          tabSize: 2,
        }"
        :style="{
          outline: `solid 1px ${
            !!wfParamsError
              ? $vuetify.theme.themes.light.error
              : $colors.grey.lighten1
          }`,
        }"
        class="mx-4 mt-4 mb-2 elevation-2 input-field-large"
      />
      <div
        class="mx-4 v-messages theme--light"
        :class="{ 'error--text': !!wfParamsError }"
        v-text="
          !!wfParamsError
            ? wfParamsError
            : 'Optional: JSON or YAML object, type or drag-and-drop'
        "
      />
    </div>
    <div class="d-flex justify-end pb-6 mr-12">
      <v-btn
        color="primary"
        outlined
        width="140"
        :disabled="
          !formValid || service.state !== 'Available' || !executeButton
        "
        @click.stop="executeRun"
      >
        <v-icon class="mr-2" v-text="'mdi-rocket-launch-outline'" />
        <span v-text="'Execute'" />
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import { codemirror } from 'vue-codemirror'
import {
  codeMirrorMode,
  isJson,
  isYaml,
  yamlToJson,
  parseJsonOrYaml,
} from '@/utils'
import { Run } from '@/store/runs'
import { Service, WorkflowEngine } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Workflow } from '@/store/workflows'
import Vue from 'vue'

type Data = {
  runName: string
  wfEngine: string
  wfEngineParams: string
  tags: string
  wfAttachmentText: string
  workflowAttachment: Array<File | null>
  fileNames: Array<string | null>
  wfParams: string
  executeButton: boolean
}

type Methods = {
  executeRun: () => Promise<void>
  updateWorkflowAttachment: (file: File | null, ind: number) => void
  updateFileName: (fileName: string | null, ind: number) => void
  incrementWorkflowAttachment: () => void
  decrementWorkflowAttachment: () => void
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
}

type Computed = {
  service: Service
  serviceWorkflowAttachment: boolean
  workflow: Workflow
  runNames: string[]
  wfEngines: string[]
  formValid: boolean
  runNameError: string
  wfEngineError: string
  wfEngineParamsError: string
  tagsError: string
  wfAttachmentTextError: string
  wfParamsError: string
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
  },

  props: {
    workflowId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      runName: '',
      wfEngine: '',
      wfEngineParams: '{}',
      tags: '{}',
      wfAttachmentText: '',
      workflowAttachment: [null],
      fileNames: [null],
      wfParams: '{}',
      executeButton: true,
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.workflow.serviceId)
    },

    serviceWorkflowAttachment() {
      return this.$store.getters['services/workflowAttachment'](
        this.workflow.serviceId
      )
    },

    workflow() {
      return this.$store.getters['workflows/workflow'](this.workflowId)
    },

    runNames() {
      return this.$store.getters['runs/runsByIds'](this.service.runIds).map(
        (run: Run) => run.name
      )
    },

    wfEngines(): string[] {
      return this.$store.getters['services/workflowEngines'](
        this.service.id
      ).map(
        (wfEngine: WorkflowEngine) => `${wfEngine.name} ${wfEngine.version}`
      )
    },

    formValid(): boolean {
      return (
        !this.runNameError &&
        !this.wfEngineError &&
        !this.wfEngineParamsError &&
        !this.tagsError &&
        !this.wfParamsError
      )
    },

    runNameError(): string {
      if (!this.runName) {
        return 'Required'
      }
      if (this.runNames.includes(this.runName)) {
        return `'Run name: ${this.runName} already exists.`
      }
      return ''
    },

    wfEngineError(): string {
      if (!this.wfEngine) {
        return 'Reguired'
      }
      if (!this.wfEngines.includes(this.wfEngine)) {
        return `Workflow engine: ${this.wfEngine} is not a valid workflow engine.`
      }

      return ''
    },

    wfEngineParamsError(): string {
      if (isJson(this.wfEngineParams) || isYaml(this.wfEngineParams)) {
        return ''
      } else {
        return 'Invalid format: valid format is JSON or YAML.'
      }
    },

    tagsError(): string {
      if (isJson(this.wfEngineParams) || isYaml(this.wfEngineParams)) {
        return ''
      } else {
        return 'Invalid format: valid format is JSON or YAML.'
      }
    },

    wfAttachmentTextError(): string {
      if (isJson(this.wfAttachmentText) || isYaml(this.wfAttachmentText)) {
        try {
          const content = parseJsonOrYaml(this.wfAttachmentText)
          if (!Array.isArray(content)) {
            return 'The type of tags should be `Array<{file_name: string, file_url: string}>`.'
          } else {
            for (const item of content) {
              if (!('file_name' in item) || !('file_url' in item)) {
                return 'The type of tags should be `Array<{file_name: string, file_url: string}>`.'
              }
            }
          }
        } catch {
          return 'Unknown error: workflow attachment'
        }
      } else {
        return 'Invalid format: valid format is JSON or YAML.'
      }
      return ''
    },

    wfParamsError(): string {
      if (isJson(this.wfParams) || isYaml(this.wfParams)) {
        return ''
      } else {
        return 'Invalid format: valid format is JSON or YAML.'
      }
    },
  },

  created() {
    this.runName = `${this.workflow.name} ${this.$dayjs()
      .local()
      .format('YYYY-MM-DD HH:mm:ss')}`
    if (this.wfEngines.length === 1) {
      this.wfEngine = this.wfEngines[0]
    }
    this.wfAttachmentText = JSON.stringify(
      this.workflow.preRegisteredWorkflowAttachment,
      null,
      2
    )
  },

  methods: {
    async executeRun(): Promise<void> {
      if (this.formValid) {
        this.executeButton = false
        await this.$store
          .dispatch('runs/executeRun', {
            service: this.service,
            workflow: this.workflow,
            runName: this.runName,
            wfEngineName: this.wfEngine.split(' ')[0],
            wfEngineParams: isYaml(this.wfEngineParams)
              ? yamlToJson(this.wfEngineParams)
              : this.wfEngineParams,
            tags: isYaml(this.tags) ? yamlToJson(this.tags) : this.tags,
            wfAttachmentText: isYaml(this.wfAttachmentText)
              ? yamlToJson(this.wfAttachmentText)
              : this.wfAttachmentText,
            workflowAttachment: this.workflowAttachment,
            fileNames: this.fileNames,
            wfParams: isYaml(this.wfParams)
              ? yamlToJson(this.wfParams)
              : this.wfParams,
          })
          .then((runId) => {
            this.$router.push({ path: '/runs', query: { runId } })
          })
      }
    },

    updateWorkflowAttachment(file: File | null, ind: number) {
      if (file === null) {
        Vue.set(this.fileNames, ind, null)
      } else {
        Vue.set(this.fileNames, ind, file.name)
      }
    },

    updateFileName(fileName: string | null, ind: number) {
      if (fileName === null) {
        const file: File | null = this.workflowAttachment[ind]
        if (file !== null) {
          Vue.set(this.fileNames, ind, file.name)
        }
      }
    },

    incrementWorkflowAttachment() {
      this.workflowAttachment.push(null)
      this.fileNames.push(null)
    },

    decrementWorkflowAttachment() {
      const len = this.workflowAttachment.length
      if (len > 1) {
        this.workflowAttachment = this.workflowAttachment.slice(0, len - 1)
        this.fileNames = this.fileNames.slice(0, len - 1)
      }
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },
  },
}

export default Vue.extend(options)
</script>

<style scoped>
.param-card-header {
  font-family: 'Quicksand', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  background: #eeeeee;
}
.field-header {
  font-size: 1.1rem;
  font-weight: 400;
}
.input-field-small >>> .CodeMirror {
  height: 150px !important;
  font-size: 0.9rem !important;
}
.input-field-small >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
.input-field-middle >>> .CodeMirror {
  height: 300px !important;
  font-size: 0.9rem !important;
}
.input-field-middle >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
.input-field-large >>> .CodeMirror {
  height: 400px !important;
  font-size: 0.9rem !important;
}
.input-field-large >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
</style>
