<template>
  <v-card elevation="8" max-width="1200">
    <div class="card-header pl-6 pt-4" v-text="'Execute Run'" />
    <div class="px-12 py-4">
      <div class="field-header" v-text="'Run Name'" />
      <v-text-field
        v-model="runName"
        :error-messages="runNameError"
        class="pt-0 px-4 pb-4"
        clearable
        hint="Required."
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
        hint="Required."
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
        class="mx-4 mt-4 my-2 elevation-2 input-field-small"
      />
      <div
        class="mx-4 v-messages theme--light"
        :class="{ 'error--text': !!wfEngineParamsError }"
        v-text="
          !!wfEngineParamsError
            ? wfEngineParamsError
            : 'Not required, JSON or YAML object, multiple lines, you can use file drag and drop.'
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
        class="mx-4 mt-4 my-2 elevation-2 input-field-small"
      />
      <div
        class="mx-4 v-messages theme--light"
        :class="{ 'error--text': !!tagsError }"
        v-text="
          !!tagsError
            ? tagsError
            : 'Not required, JSON or YAML object, multiple lines, you can use file drag and drop.'
        "
      />
      <div class="mt-4 mb-2 field-header" v-text="'Workflow Attachment'" />
      <codemirror
        v-if="workflow.preRegisteredWorkflowAttachment.length"
        :value="`${JSON.stringify(
          workflow.preRegisteredWorkflowAttachment,
          null,
          2
        )}`"
        :options="{
          lineNumbers: true,
          mode: 'application/json',
          tabSize: 2,
          readOnly: true,
        }"
        :style="{
          outline: `solid 1px $colors.grey.lighten1`,
        }"
        class="mx-4 mt-4 mb-4 elevation-2 input-field-middle"
      />
      <div v-if="serviceWorkflowAttachment" class="d-flex flex-column mx-4">
        <div v-for="ind in workflowAttachment.length" :key="ind" class="d-flex">
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
          class="mx-4 v-messages theme--light"
          v-text="'Not required, multiple files.'"
        />
        <div class="d-flex justify-end">
          <v-btn
            class="mr-4"
            :color="$colors.grey.darken2"
            outlined
            @click.stop="incrementWorkflowAttachment"
          >
            <v-icon class="mr-2">mdi-text-box-plus-outline</v-icon>
            Increment
          </v-btn>
          <v-btn
            :color="$colors.grey.darken2"
            outlined
            @click.stop="decrementWorkflowAttachment"
          >
            <v-icon class="mr-2">mdi-text-box-minus-outline</v-icon>
            Decrement
          </v-btn>
        </div>
      </div>
      <div
        v-if="!serviceWorkflowAttachment"
        class="mx-6 mb-4"
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
        class="mx-4 mt-4 my-2 elevation-2 input-field-large"
      />
      <div
        class="mx-4 v-messages theme--light"
        :class="{ 'error--text': !!wfParamsError }"
        v-text="
          !!wfParamsError
            ? wfParamsError
            : 'Not required, JSON or YAML object, multiple lines, you can use file drag and drop.'
        "
      />
    </div>
    <div class="d-flex justify-end pb-6 mr-12">
      <v-btn
        color="primary"
        outlined
        :disabled="!formValid || service.state !== 'Available'"
        @click.stop="executeRun"
      >
        <v-icon class="mr-2">mdi-rocket-launch-outline</v-icon>Execute
      </v-btn>
    </div>
    <v-snackbar v-model="errorSnackbar" color="error" elevation="8" top>
      Error!! There's something problem with the values you inputted.
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import { codemirror } from 'vue-codemirror'
import { codeMirrorMode, isJson, isYaml, yamlToJson } from '@/utils'
import { Run } from '@/store/runs'
import { Service, WorkflowEngine } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Workflow } from '@/store/workflows'
import dayjs from 'dayjs'
import Vue from 'vue'

type Data = {
  runName: string
  wfEngine: string
  wfEngineParams: string
  tags: string
  workflowAttachment: Array<File | null>
  fileNames: Array<string | null>
  wfParams: string
  errorSnackbar: boolean
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
      workflowAttachment: [null],
      fileNames: [null],
      wfParams: '{}',
      errorSnackbar: false,
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
        return 'Run name is require.'
      }
      if (this.runNames.includes(this.runName)) {
        return `'Run name: ${this.runName} already exists.`
      }
      return ''
    },

    wfEngineError(): string {
      if (!this.wfEngine) {
        return 'Workflow engine is require.'
      }
      if (!this.wfEngines.includes(this.wfEngine)) {
        return `Workflow engine: ${this.wfEngine} is not an executable workflow engine.`
      }

      return ''
    },

    wfEngineParamsError(): string {
      if (isJson(this.wfEngineParams) || isYaml(this.wfEngineParams)) {
        return ''
      } else {
        return 'Please enter the correct JSON or YAML.'
      }
    },

    tagsError(): string {
      if (isJson(this.wfEngineParams) || isYaml(this.wfEngineParams)) {
        return ''
      } else {
        return 'Please enter the correct JSON or YAML.'
      }
    },

    wfParamsError(): string {
      if (isJson(this.wfParams) || isYaml(this.wfParams)) {
        return ''
      } else {
        return 'Please enter the correct JSON or YAML.'
      }
    },
  },

  created() {
    this.runName = `${this.workflow.name} ${dayjs(new Date()).format(
      'YYYY-MM-DD hh:mm:ss'
    )}`
  },

  methods: {
    async executeRun(): Promise<void> {
      if (this.formValid) {
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
