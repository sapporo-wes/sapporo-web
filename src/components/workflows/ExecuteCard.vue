<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-pencil-outline '" />
      <div class="card-header" v-text="'Compose Run'" />
    </div>

    <div class="mx-12 mt-4">
      <!-- Name -->
      <v-text-field
        v-model="runName"
        :persistent-hint="!runName.length"
        :rules="runNameRules"
        hint="Name of the run (free text, e.g., 'Test run' etc.)"
        label="Run Name"
        placeholder="Type a name"
      />

      <!-- Workflow Engine  -->
      <v-select
        v-model="wfEngine"
        :items="wfEngines"
        :persistent-hint="!wfEngine.length"
        :rules="wfEngineRules"
        hint="Select the workflow engine"
        label="Workflow Engine (Required)"
      />

      <!-- Workflow Attachment -->
      <div class="d-flex align-center">
        <span
          :style="{ color: `${$colors.grey.darken2}` }"
          v-text="'Workflow Attachment'"
        />
        <v-tooltip top max-width="400">
          <template #activator="{ on }">
            <v-icon right small v-on="on" v-text="'mdi-help-circle-outline'" />
          </template>
          <span
            v-text="
              '[Optional] A set of files to be fetched/uploaded to the execution directory. You can create a directory structure by writing like `dirname/filename` in the file name field.'
            "
          />
        </v-tooltip>
        <v-chip-group v-model="attachmentMode" class="ml-6" color="primary">
          <v-tooltip top>
            <template #activator="{ on }">
              <div v-on="!serviceWorkflowAttachment && on">
                <v-chip
                  :disabled="!serviceWorkflowAttachment"
                  :value="'fetch'"
                  class="my-0 py-0"
                  label
                  outlined
                >
                  <v-icon left v-text="'mdi-download-outline'" />
                  <span v-text="'Fetch'" />
                </v-chip>
              </div>
            </template>
            <span
              v-text="'The WES service does not allow workflow attachment.'"
            />
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <div v-on="!serviceWorkflowAttachment && on">
                <v-chip
                  :disabled="!serviceWorkflowAttachment"
                  :value="'upload'"
                  class="my-0 py-0"
                  label
                  outlined
                >
                  <v-icon left v-text="'mdi-upload-outline'" />
                  <span v-text="'Upload'" />
                </v-chip>
              </div>
            </template>
            <span
              v-text="'The WES service does not allow workflow attachment.'"
            />
          </v-tooltip>
        </v-chip-group>
        <v-spacer />
        <v-btn
          v-if="!!attachmentMode && !!serviceWorkflowAttachment"
          :color="$colors.grey.darken2"
          class="mr-4"
          outlined
          small
          width="120"
          @click.stop="addWfAttachment"
        >
          <v-icon left v-text="'mdi-text-box-plus-outline'" />
          <span v-text="'Add'" />
        </v-btn>
        <v-btn
          v-if="!!attachmentMode && !!serviceWorkflowAttachment"
          :color="$colors.grey.darken2"
          outlined
          small
          width="120"
          @click.stop="removeWfAttachment"
        >
          <v-icon left v-text="'mdi-text-box-minus-outline'" />
          <span v-text="'Remove'" />
        </v-btn>
      </div>
      <div v-if="attachmentMode === 'fetch'" class="d-flex flex-column">
        <div
          v-for="ind in wfAttachment[attachmentMode].names.length"
          :key="ind"
          class="d-flex ml-8"
        >
          <v-text-field
            v-model="wfAttachment[attachmentMode].urls[ind - 1]"
            :disabled="!serviceWorkflowAttachment"
            :persistent-hint="!wfAttachment[attachmentMode].urls[ind - 1]"
            :rules="wfAttachmentRules[attachmentMode].urls[ind - 1]"
            :style="{ maxWidth: '47%', minWidth: '47%' }"
            class="my-0 mr-auto"
            clearable
            hint="Network reachable location of the workflow attachment"
            label="URL"
            placeholder="Type a URL"
            @input="updateWfAttachmentUrl($event, ind - 1)"
          />
          <v-text-field
            v-model="wfAttachment[attachmentMode].names[ind - 1]"
            :disabled="!serviceWorkflowAttachment"
            :persistent-hint="!wfAttachment[attachmentMode].names[ind - 1]"
            :rules="wfAttachmentRules[attachmentMode].names[ind - 1]"
            :style="{ maxWidth: '47%', minWidth: '47%' }"
            class="my-0"
            clearable
            hint="The name of the workflow attachment when it is placed in the execution directory"
            label="File Name"
            placeholder="Type a file name"
            @input="updateWfAttachmentName($event, ind - 1)"
          />
        </div>
      </div>
      <div v-if="attachmentMode === 'upload'" class="d-flex flex-column">
        <div
          v-for="ind in wfAttachment[attachmentMode].names.length"
          :key="ind"
          class="d-flex ml-8"
        >
          <v-file-input
            v-model="wfAttachment[attachmentMode].files[ind - 1]"
            :disabled="!serviceWorkflowAttachment"
            :persistent-hint="!wfAttachment[attachmentMode].files[ind - 1]"
            :prepend-icon="null"
            :rules="wfAttachmentRules[attachmentMode].files[ind - 1]"
            :style="{ maxWidth: '47%', minWidth: '47%' }"
            class="my-0 mr-auto"
            clearable
            hint="The file to be attached"
            label="File"
            placeholder="Select a file"
            prepend-inner-icon="mdi-paperclip"
            show-size
            @change="updateWfAttachmentFile($event, ind - 1)"
          />
          <v-text-field
            v-model="wfAttachment[attachmentMode].names[ind - 1]"
            :disabled="!serviceWorkflowAttachment"
            :persistent-hint="!wfAttachment[attachmentMode].names[ind - 1]"
            :rules="wfAttachmentRules[attachmentMode].names[ind - 1]"
            :style="{ maxWidth: '47%', minWidth: '47%' }"
            class="my-0"
            clearable
            hint="The name of the workflow attachment when it is placed in the execution directory"
            label="File Name"
            placeholder="Type a file name"
            @input="updateWfAttachmentName($event, ind - 1)"
          />
        </div>
      </div>

      <!-- Workflow Parameters -->
      <div class="d-flex align-center mt-4">
        <span
          :style="{ color: `${$colors.grey.darken2}` }"
          v-text="'Workflow Parameters'"
        />
        <v-tooltip top max-width="400">
          <template #activator="{ on }">
            <v-icon right small v-on="on" v-text="'mdi-help-circle-outline'" />
          </template>
          <span
            v-text="
              '[Optional] A JSON object for workflow parameters, which will be placed in the execution directory with the filename `workflow_params.json`. If you want to use a parameter file in a format other than JSON/YAML, use the Workflow Attachment field.'
            "
          />
        </v-tooltip>
        <v-chip-group
          v-if="inputsParsable"
          v-model="wfParamsMode"
          class="ml-6"
          color="primary"
        >
          <v-chip
            :value="'form'"
            class="my-0 py-0"
            label
            outlined
            :disabled="!wfParamsInputs.length"
          >
            <v-icon left v-text="'mdi-form-select'" />
            <span v-text="'Form'" />
          </v-chip>
          <v-chip :value="'text'" class="my-0 py-0" label outlined>
            <v-icon left v-text="'mdi-format-text'" />
            <span v-text="'Text'" />
          </v-chip>
        </v-chip-group>
      </div>
      <div v-if="showWfParamsForm" class="mx-6">
        <wf-params-form ref="wfParamsForm" :inputs="wfParamsInputs" />
      </div>
      <div v-if="showWfParamsText" class="d-flex flex-column ml-8 mt-4">
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
          class="elevation-2 input-field-middle"
        />
        <div
          class="mt-2 v-messages theme--light"
          :class="{ 'error--text': !!wfParamsError }"
          v-text="
            !!wfParamsError
              ? wfParamsError
              : 'Drag-and-Drop or Copy-and-Paste parameters in JSON/YAML format into this box'
          "
        />
      </div>

      <!-- Workflow Engine Parameters -->
      <div class="d-flex align-center mt-4">
        <span
          :style="{ color: `${$colors.grey.darken2}` }"
          v-text="'Workflow Engine Parameters'"
        />
        <v-tooltip top max-width="400">
          <template #activator="{ on }">
            <v-icon right small v-on="on" v-text="'mdi-help-circle-outline'" />
          </template>
          <span
            v-text="
              '[Optional] A JSON object to pass additional arguments to the workflow engine, where key and value will be joined.'
            "
          />
        </v-tooltip>
        <v-icon
          right
          @click="wfEngineParamsExpand = !wfEngineParamsExpand"
          v-text="
            !wfEngineParamsExpand
              ? 'mdi-arrow-expand-vertical'
              : 'mdi-arrow-collapse-vertical'
          "
        />
      </div>
      <div v-if="wfEngineParamsExpand" class="d-flex flex-column ml-8 mt-4">
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
          class="elevation-2 input-field-small"
        />
        <div
          class="mt-2 v-messages theme--light"
          :class="{ 'error--text': !!wfParamsError }"
          v-text="
            !!wfParamsError
              ? wfParamsError
              : 'Drag-and-Drop or Copy-and-Paste parameters in JSON/YAML format into this box'
          "
        />
      </div>

      <!-- Tags -->
      <div class="d-flex align-center mt-4">
        <span :style="{ color: `${$colors.grey.darken2}` }" v-text="'Tags'" />
        <v-tooltip top max-width="400">
          <template #activator="{ on }">
            <v-icon right small v-on="on" v-text="'mdi-help-circle-outline'" />
          </template>
          <span
            v-text="
              '[Optional] A JSON object for adding metadata and changing the behavior of the WES itself.'
            "
          />
        </v-tooltip>
        <v-icon
          right
          @click="tagsExpand = !tagsExpand"
          v-text="
            !tagsExpand
              ? 'mdi-arrow-expand-vertical'
              : 'mdi-arrow-collapse-vertical'
          "
        />
      </div>
      <div v-if="tagsExpand" class="d-flex flex-column ml-8 mt-4">
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
          class="elevation-2 input-field-small"
        />
        <div
          class="mt-2 v-messages theme--light"
          :class="{ 'error--text': !!tagsError }"
          v-text="
            !!tagsError
              ? tagsError
              : 'Drag-and-Drop or Copy-and-Paste parameters in JSON/YAML format into this box'
          "
        />
      </div>
    </div>

    <div class="d-flex justify-end pb-6 mx-12 mt-4">
      <v-btn
        color="primary"
        outlined
        width="140"
        :disabled="
          !formValid || service.state !== 'Available' || !executeButton
        "
        @click.stop="executeRun"
      >
        <v-icon left v-text="'mdi-rocket-launch-outline'" />
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
import Vue, { defineComponent } from 'vue'
import { codeMirrorMode, isJson, isYaml, yamlToJson } from '@/utils'
import { Run } from '@/store/runs'
import { Service, WorkflowEngine } from '@/store/services'
import { Workflow } from '@/store/workflows'
import { AttachedFile, ParseResult } from '@/types/WES'
import { parseWorkflow, WesVersions } from '@/utils/WESRequest'
import WfParamsForm from '@/components/workflows/WfParamsForm.vue'

type StringAttachments = (string | null)[]
type FileAttachments = (File | null)[]
type WfAttachment = {
  fetch: {
    urls: StringAttachments
    names: StringAttachments
  }
  upload: {
    files: FileAttachments
    names: StringAttachments
  }
}
type WfAttachmentRules = {
  fetch: {
    urls: string[][]
    names: string[][]
  }
  upload: {
    files: string[][]
    names: string[][]
  }
}

export default defineComponent({
  components: {
    codemirror,
    WfParamsForm,
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
      attachmentMode: undefined as string | undefined,
      wfAttachment: {
        fetch: {
          urls: [null],
          names: [null],
        },
        upload: {
          files: [null],
          names: [null],
        },
      } as WfAttachment,
      wfParamsMode: null as 'form' | 'text' | null,
      wfParamsInputs: [] as ParseResult['inputs'],
      wfParams: '{}',
      wfEngineParams: '{}',
      wfEngineParamsExpand: false,
      tags: '{}',
      tagsExpand: false,
      executeButton: true,
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.workflow.serviceId)
    },

    wesVersion(): WesVersions {
      return this.$store.getters['services/wesVersion'](this.workflow.serviceId)
    },

    inputsParsable(): boolean {
      return this.wesVersion === 'sapporo-1.0.1' && this.workflow.type === 'CWL'
    },

    showWfParamsText(): boolean {
      return this.inputsParsable ? this.wfParamsMode === 'text' : true
    },

    showWfParamsForm(): boolean {
      return this.inputsParsable ? this.wfParamsMode === 'form' : false
    },

    serviceWorkflowAttachment(): boolean {
      return this.$store.getters['services/workflowAttachment'](
        this.workflow.serviceId
      )
    },

    workflow(): Workflow {
      return this.$store.getters['workflows/workflow'](this.workflowId)
    },

    runNames(): string[] {
      return this.$store.getters['runs/runsByIds'](this.service.runIds).map(
        (run: Run) => run.name
      )
    },

    runNameRules(): string[] {
      if (!this.runName) {
        return ['Required']
      }
      if (this.runNames.includes(this.runName)) {
        return ['Typed name already exists']
      }
      return []
    },

    wfEngines(): string[] {
      return this.$store.getters['services/workflowEngines'](
        this.service.id
      ).map(
        (wfEngine: WorkflowEngine) => `${wfEngine.name} ${wfEngine.version}`
      )
    },

    wfEngineRules(): string[] {
      if (!this.wfEngine) {
        return ['Required']
      }
      return []
    },

    wfAttachmentRules(): WfAttachmentRules {
      const rules: WfAttachmentRules = {
        fetch: {
          urls: [],
          names: [],
        },
        upload: {
          files: [],
          names: [],
        },
      }
      for (let i = 0; i < this.wfAttachment.fetch.names.length; i++) {
        if (
          !!this.wfAttachment.fetch.urls[i] !==
          !!this.wfAttachment.fetch.names[i]
        ) {
          if (!this.wfAttachment.fetch.urls[i]) {
            rules.fetch.urls.push(['No value in this field'])
            rules.fetch.names.push([] as string[])
          }
          if (!this.wfAttachment.fetch.names[i]) {
            rules.fetch.urls.push([] as string[])
            rules.fetch.names.push(['No value in this field'])
          }
        } else {
          rules.fetch.urls.push([] as string[])
          rules.fetch.names.push([] as string[])
        }
      }
      for (let i = 0; i < this.wfAttachment.upload.names.length; i++) {
        if (
          !!this.wfAttachment.upload.files[i] !==
          !!this.wfAttachment.upload.names[i]
        ) {
          if (!this.wfAttachment.upload.files[i]) {
            rules.upload.files.push(['No value in this field'])
            rules.upload.names.push([] as string[])
          }
          if (!this.wfAttachment.upload.names[i]) {
            rules.upload.files.push([] as string[])
            rules.upload.names.push(['No value in this field'])
          }
        } else {
          rules.upload.files.push([] as string[])
          rules.upload.names.push([] as string[])
        }
      }
      return rules
    },

    wfParamsError(): string {
      if (isJson(this.wfParams) || isYaml(this.wfParams)) {
        return ''
      } else {
        return 'Invalid JSON or YAML'
      }
    },

    wfEngineParamsError(): string {
      if (isJson(this.wfEngineParams) || isYaml(this.wfEngineParams)) {
        return ''
      } else {
        return 'Invalid JSON or YAML'
      }
    },

    tagsError(): string {
      if (isJson(this.tags) || isYaml(this.tags)) {
        return ''
      } else {
        return 'Invalid JSON or YAML'
      }
    },

    formValid(): boolean {
      const wfAttachmentValid =
        !this.wfAttachmentRules.fetch.urls
          .map((rules) => rules.length)
          .reduce((a, b) => a + b, 0) &&
        !this.wfAttachmentRules.fetch.names
          .map((rules) => rules.length)
          .reduce((a, b) => a + b, 0) &&
        !this.wfAttachmentRules.upload.files
          .map((rules) => rules.length)
          .reduce((a, b) => a + b, 0) &&
        !this.wfAttachmentRules.upload.names
          .map((rules) => rules.length)
          .reduce((a, b) => a + b, 0)
      let wfParamsFormValid = true
      if (this.wfParamsMode === 'form') {
        if (this.$refs.wfParamsForm) {
          wfParamsFormValid = (
            this.$refs.wfParamsForm as unknown as { validate(): boolean }
          ).validate()
        }
      }
      return (
        !this.runNameRules.length &&
        !this.wfEngineRules.length &&
        !this.wfParamsError &&
        !this.wfEngineParamsError &&
        !this.tagsError &&
        wfAttachmentValid &&
        wfParamsFormValid
      )
    },
  },

  watch: {
    wfEngine() {
      if (this.wesVersion === 'sapporo-1.0.1') {
        const wfEngineName = this.wfEngine.split(' ')[0] || ''
        const defaultWfEngineParams = this.service.serviceInfo
          .default_workflow_engine_parameters as {
          // eslint-disable-next-line camelcase
          [key: string]: { name: string; default_value: string }[]
        }
        if (wfEngineName in defaultWfEngineParams) {
          const paramsObj: { [key: string]: string } = {}
          for (const param of defaultWfEngineParams[wfEngineName]) {
            paramsObj[param.name] = param.default_value
          }
          this.wfEngineParams = JSON.stringify(paramsObj, null, 2)
          this.wfEngineParamsExpand = true
        } else {
          this.wfEngineParams = ''
          this.wfEngineParamsExpand = false
        }
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

    // set default wfEngine
    if (this.workflow.type === 'CWL') {
      this.wfEngine =
        this.wfEngines.find((wfEngine) => {
          return wfEngine.includes('cwltool')
        }) || ''
    } else if (this.workflow.type === 'WDL') {
      this.wfEngine =
        this.wfEngines.find((wfEngine) => {
          return wfEngine.includes('cromwell')
        }) || ''
    } else if (this.workflow.type === 'NFL') {
      this.wfEngine =
        this.wfEngines.find((wfEngine) => {
          return wfEngine.includes('nextflow')
        }) || ''
    } else if (this.workflow.type === 'SMK') {
      this.wfEngine =
        this.wfEngines.find((wfEngine) => {
          return wfEngine.includes('snakemake')
        }) || ''
    }

    if (this.workflow.preRegisteredWorkflowAttachment.length) {
      this.wfAttachment.fetch.urls.pop()
      this.wfAttachment.fetch.names.pop()
      for (const attachedFile of this.workflow
        .preRegisteredWorkflowAttachment) {
        this.wfAttachment.fetch.urls.push(attachedFile.file_url)
        this.wfAttachment.fetch.names.push(attachedFile.file_name)
      }
      this.attachmentMode = 'fetch'
    }

    if (this.inputsParsable) {
      this.wfParamsMode = 'form'

      // for form
      parseWorkflow(this.service.endpoint, {
        workflow_content: this.workflow.content,
        types_of_parsing: ['inputs'],
      })
        .then((res) => {
          this.wfParamsInputs = res.inputs || []
        })
        .catch((_) => {
          this.wfParamsMode = 'text'
        })

      // for text
      this.wfParams = 'Making template by cwltool...'
      parseWorkflow(this.service.endpoint, {
        workflow_content: this.workflow.content,
        types_of_parsing: ['make_template'],
      })
        .then((res) => {
          this.wfParams = res.inputs as string
        })
        .catch((_) => {
          this.wfParams = '{}'
        })
    }
  },

  methods: {
    executeRun(): void {
      if (
        this.formValid ||
        this.service.state === 'Available' ||
        this.executeButton
      ) {
        this.executeButton = false
        const wfAttachmentObj: AttachedFile[] = []
        for (let i = 0; i < this.wfAttachment.fetch.urls.length; i++) {
          if (this.wfAttachment.fetch.urls[i]) {
            wfAttachmentObj.push({
              file_url: this.wfAttachment.fetch.urls[i] as string,
              file_name: this.wfAttachment.fetch.names[i] as string,
            })
          }
        }

        const wfParams = (() => {
          if (this.wfParamsMode === 'form') {
            if (this.$refs.wfParamsForm) {
              return (
                this.$refs.wfParamsForm as unknown as {
                  toParams(): string
                }
              ).toParams()
            } else {
              return '{}'
            }
          } else {
            return isYaml(this.wfParams)
              ? yamlToJson(this.wfParams)
              : this.wfParams
          }
        })()

        this.$store
          .dispatch('runs/executeRun', {
            service: this.service,
            workflow: this.workflow,
            runName: this.runName,
            wfEngineName: this.wfEngine.split(' ')[0],
            wfEngineParams: isYaml(this.wfEngineParams)
              ? yamlToJson(this.wfEngineParams)
              : this.wfEngineParams,
            tags: isYaml(this.tags) ? yamlToJson(this.tags) : this.tags,
            wfAttachmentText: JSON.stringify(wfAttachmentObj, null, 2),
            workflowAttachment: this.wfAttachment.upload.files,
            fileNames: this.wfAttachment.upload.names,
            wfParams,
          })
          .then((runId) => {
            this.$router.push({ path: '/runs', query: { runId } })
          })
      }
    },

    updateWfAttachmentUrl(url: string | null, ind: number) {
      Vue.set(this.wfAttachment.fetch.urls, ind, url)
      if (url) {
        try {
          const tmpUrl = new URL(url)
          const fileName = tmpUrl.pathname.split('/').pop() || ''
          Vue.set(this.wfAttachment.fetch.names, ind, fileName)
        } catch {
          // do nothing
        }
      }
    },

    updateWfAttachmentName(name: string | null, ind: number) {
      Vue.set(
        this.wfAttachment[this.attachmentMode as 'fetch' | 'upload'].names,
        ind,
        name
      )
    },

    updateWfAttachmentFile(file: File | null, ind: number) {
      Vue.set(this.wfAttachment.upload.files, ind, file)
      if (file) {
        try {
          const fileName = file.name || ''
          Vue.set(this.wfAttachment.upload.names, ind, fileName)
        } catch {
          // do nothing
        }
      }
    },

    addWfAttachment(): void {
      if (this.attachmentMode === 'fetch') {
        this.wfAttachment.fetch.urls.push(null)
        this.wfAttachment.fetch.names.push(null)
      } else if (this.attachmentMode === 'upload') {
        this.wfAttachment.upload.files.push(null)
        this.wfAttachment.upload.names.push(null)
      }
    },

    removeWfAttachment(): void {
      if (
        this.attachmentMode === 'fetch' &&
        this.wfAttachment.fetch.names.length > 1
      ) {
        this.wfAttachment.fetch.urls.pop()
        this.wfAttachment.fetch.names.pop()
      } else if (
        this.attachmentMode === 'upload' &&
        this.wfAttachment.fetch.names.length > 1
      ) {
        this.wfAttachment.upload.files.pop()
        this.wfAttachment.upload.names.pop()
      }
    },

    codeMirrorMode(content: string): ReturnType<typeof codeMirrorMode> {
      return codeMirrorMode(content)
    },
  },
})
</script>

<style scoped>
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
</style>
