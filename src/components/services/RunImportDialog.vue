<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="900"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="d-flex align-center mx-6 pt-4">
        <v-icon color="black" left v-text="'mdi-sticker-plus-outline'" />
        <div class="card-header" v-text="'Import Run'" />
      </div>
      <div class="mx-12 my-2">
        <v-text-field
          v-model="runId"
          :persistent-hint="!runId.length"
          :rules="runIdRules"
          class="ma-0"
          hint="Enter the Run ID included in this WES service"
          label="Run ID"
          placeholder="Enter the Run ID"
          @input="changeRunId"
        />

        <v-text-field
          v-if="!getFailed"
          v-model="runName"
          class="ma-0"
          label="Run Name"
          readonly
        />

        <v-text-field
          v-if="!getFailed"
          v-model="workflowName"
          class="ma-0"
          label="Workflow Name"
          readonly
        />

        <div class="d-flex">
          <v-text-field
            v-if="!getFailed"
            v-model="workflowType"
            :style="{ maxWidth: '48%', minWidth: '48%' }"
            class="my-0 mr-auto"
            label="Workflow Type"
            readonly
          />

          <v-text-field
            v-if="!getFailed"
            v-model="workflowVersion"
            :style="{ maxWidth: '48%', minWidth: '48%' }"
            class="ma-0"
            label="Workflow Version"
            readonly
          />
        </div>

        <v-text-field
          v-if="!getFailed"
          v-model="workflowUrl"
          class="ma-0"
          label="Workflow URL"
          readonly
        />
        <codemirror
          v-if="!getFailed"
          v-model="workflowContent"
          :options="{
            lineNumbers: true,
            tabSize: 2,
            mode: codeMirrorMode(workflowContent),
            readOnly: 'nocursor',
          }"
          :style="{
            outline: `solid 1px ${$colors.grey.lighten1}`,
          }"
          class="elevation-2 content-viewer"
        />
      </div>
      <div class="d-flex justify-end mx-12 pb-6 mt-4">
        <v-btn
          :disabled="!formValid"
          color="primary"
          outlined
          @click.stop="importRun"
        >
          <v-icon left v-text="'mdi-sticker-plus-outline'" />
          <span v-text="'import'" />
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import { codemirror } from 'vue-codemirror'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { codeMirrorMode, validUrl, convertGitHubUrl } from '@/utils'
import { Service } from '@/store/services'
import { getRunsId } from '@/utils/WESRequest'
import { CwlWesLog, Log, RunLog } from '@/types/WES'
import { Workflow } from '@/store/workflows'

const changeQueue: Array<NodeJS.Timeout> = []

type Data = {
  runId: string
  getFailed: boolean
  runLog: RunLog | undefined
  runName: string
  workflowName: string
  workflowType: string
  workflowVersion: string
  workflowUrl: string
  workflowContent: string
}

type Methods = {
  changeRunId: () => void
  getRunsId: (runId: string) => void
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
  importRun: () => void
}

type Computed = {
  service: Service
  workflows: Workflow[]
  runIdRules: string[]
  formValid: boolean
}

type Props = {
  dialogShow: boolean
  serviceId: string
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
    dialogShow: {
      type: Boolean,
      default: false,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      runId: '',
      getFailed: true,
      runLog: undefined,
      runName: '',
      workflowName: '',
      workflowType: '',
      workflowVersion: '',
      workflowUrl: '',
      workflowContent: '',
    }
  },

  computed: {
    service() {
      return this.$store.getters['services/service'](this.serviceId)
    },

    workflows() {
      return this.$store.getters['workflows/workflowsByIds'](
        this.service.workflowIds
      )
    },

    runIdRules() {
      if (!this.runId) {
        return ['Required']
      }
      if (this.service.runIds.includes(this.runId)) {
        return ['The Run ID already exists']
      }
      if (this.getFailed) {
        return ['The Run ID does not exist in this WES service']
      }
      return []
    },

    formValid() {
      return !this.runIdRules.length
    },
  },

  methods: {
    changeRunId() {
      while (changeQueue.length) {
        const timeoutId = changeQueue.shift()
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
      const eventId = setTimeout(
        (runId) => {
          this.getRunsId(runId)
        },
        1000,
        this.runId
      )
      changeQueue.push(eventId)
    },

    getRunsId(runId: string) {
      if (!this.service.runIds.includes(this.runId)) {
        getRunsId(this.service.endpoint, runId)
          .then((runLog) => {
            this.getFailed = false
            this.runLog = runLog
            this.workflowName =
              runLog.request.workflow_name ||
              runLog.request.workflow_url.split('/').pop() ||
              runId
            const startTimeStr =
              this.service.serviceInfo.supported_wes_versions.includes(
                'sapporo-wes-1.0.0'
              )
                ? (runLog.run_log as Log).start_time
                : (runLog.run_log as CwlWesLog)?.task_started
            const startTime = startTimeStr
              ? this.$dayjs(startTimeStr)
              : this.$dayjs()
            this.runName = `${this.workflowName} ${startTime
              .local()
              .format('YYYY-MM-DD HH:mm:ss')}`
            this.workflowType = runLog.request.workflow_type
            this.workflowVersion = runLog.request.workflow_type_version
            this.workflowUrl = runLog.request.workflow_url
            this.workflowContent = 'Failed to get workflow content'
            if (validUrl(this.workflowUrl)) {
              convertGitHubUrl(this.workflowUrl).then((url) => {
                this.workflowUrl = url
                fetch(this.workflowUrl).then((res) => {
                  if (!res.ok) {
                    throw new Error(res.statusText)
                  }
                  res.text().then((text) => (this.workflowContent = text))
                })
              })
            } else {
              const fileName = this.workflowUrl.split('/').pop() || ''
              for (const file of runLog.request.workflow_attachment || []) {
                const attachedFileName = file.file_name.split('/').pop() || ''
                if (fileName === attachedFileName) {
                  fetch(file.file_url).then((res) => {
                    if (!res.ok) {
                      throw new Error(res.statusText)
                    }
                    res.text().then((text) => (this.workflowContent = text))
                  })
                  break
                }
              }
            }
          })
          .catch((_) => {
            this.getFailed = true
            this.runLog = undefined
            this.runName = ''
            this.workflowName = ''
            this.workflowType = ''
            this.workflowVersion = ''
            this.workflowUrl = ''
            this.workflowContent = ''
          })
      }
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    importRun() {
      if (this.formValid) {
        let workflowId = null
        this.workflows.forEach((workflow) => {
          if (workflow.name === this.workflowName) {
            workflowId = workflow.id
          }
        })
        if (workflowId) {
          this.$store.dispatch('runs/addRun', {
            serviceId: this.serviceId,
            workflowId,
            runId: this.runId,
            runName: this.runName,
            runLog: this.runLog,
          })
        } else {
          this.$store
            .dispatch('workflows/addWorkflow', {
              serviceId: this.serviceId,
              workflow: {
                workflow_name: this.workflowName,
                workflow_url: this.workflowUrl,
                workflow_type: this.workflowType,
                workflow_type_version: this.workflowVersion,
                workflow_attachment:
                  this.runLog?.request?.workflow_attachment || [],
              },
              preRegistered: false,
            })
            .then((workflowId) => {
              this.$store.dispatch('services/addWorkflowId', {
                serviceId: this.serviceId,
                workflowId,
              })
              this.$store.dispatch('runs/addRun', {
                serviceId: this.serviceId,
                workflowId,
                runId: this.runId,
                runName: this.runName,
                runLog: this.runLog,
              })
            })
        }
        this.$router.push({ path: '/runs', query: { runId: this.runId } })
      }
    },
  },
}

export default Vue.extend(options)
</script>

<style scoped>
.content-viewer >>> .CodeMirror {
  height: 200px !important;
  font-size: 0.9rem !important;
}
.content-viewer >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
</style>
