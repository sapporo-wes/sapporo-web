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
import { codeMirrorMode, convertGitHubUrl } from '@/utils'
import { fetchWorkflowContent, getRunsId } from '@/utils/WESRequest'
import { Service } from '@/store/services'
import { RunLog, AttachedFile } from '@/types/WES'
import { Workflow } from '@/store/workflows'

const changeQueue: NodeJS.Timeout[] = []

type Data = {
  runId: string
  getFailed: boolean
  runLog?: RunLog
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
  clearState: () => void
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
        return ['The Run could not be fetched correctly']
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
            if (
              !runLog.request ||
              !runLog.run_log ||
              !runLog.request.workflow_url ||
              !runLog.request.workflow_type ||
              !runLog.request.workflow_type_version
            ) {
              throw new Error('The Run could not be fetched correctly')
            }
            this.runLog = runLog
            if ('workflow_name' in runLog.request) {
              this.workflowName = runLog.request.workflow_name || runId
            } else {
              const wfUrl = runLog.request.workflow_url || ''
              this.workflowName = wfUrl.split('/').pop() || runId
            }

            let startTime = runLog.run_log.start_time
            if (!startTime && 'task_started' in runLog.run_log) {
              // for cwl-wes
              // eslint-disable-next-line camelcase
              startTime = (runLog.run_log as { task_started: string })
                .task_started
            }
            const startTimeDayJs = startTime
              ? this.$dayjs(startTime)
              : this.$dayjs()
            let startTimeStr = startTimeDayJs
              .local()
              .format('YYYY-MM-DD HH:mm:ss')
            if (startTimeStr === 'Invalid Date') {
              startTimeStr = startTime || ''
            }

            this.runName = `${this.workflowName} ${startTimeStr}`
            this.workflowType = runLog.request.workflow_type
            this.workflowVersion = runLog.request.workflow_type_version
            let wfAttachment: AttachedFile[] = []
            if ('workflow_attachment' in runLog.request) {
              wfAttachment = runLog.request
                .workflow_attachment as AttachedFile[]
            }
            convertGitHubUrl(runLog.request.workflow_url).then((url) => {
              this.workflowUrl = url
            })
            fetchWorkflowContent({
              workflow_name: this.workflowName,
              workflow_url: runLog.request.workflow_url,
              workflow_type: this.workflowType,
              workflow_type_version: this.workflowVersion,
              workflow_attachment: wfAttachment,
            })
              .then((wfContent) => {
                this.workflowContent = wfContent
              })
              .catch(() => {
                throw new Error('The Workflow could not be fetched correctly')
              })
            this.getFailed = false
          })
          .catch((_) => {
            this.getFailed = true
            this.clearState()
          })
      }
    },

    clearState() {
      this.runLog = undefined
      this.runName = ''
      this.workflowName = ''
      this.workflowType = ''
      this.workflowVersion = ''
      this.workflowUrl = ''
      this.workflowContent = ''
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    importRun() {
      if (this.formValid) {
        const workflowId = this.workflows.filter(
          (wf) => wf.name === this.workflowName
        )[0]?.id
        if (workflowId) {
          this.$store.dispatch('runs/addRun', {
            serviceId: this.serviceId,
            workflowId,
            runId: this.runId,
            runName: this.runName,
            runLog: this.runLog,
          })
        } else {
          let wfAttachment: AttachedFile[] = []
          if (
            this.runLog?.request &&
            'workflow_attachment' in this.runLog.request
          ) {
            wfAttachment = this.runLog.request
              .workflow_attachment as AttachedFile[]
          }
          this.$store
            .dispatch('workflows/addWorkflow', {
              serviceId: this.serviceId,
              workflow: {
                workflow_name: this.workflowName,
                workflow_url: this.workflowUrl,
                workflow_type: this.workflowType,
                workflow_type_version: this.workflowVersion,
                workflow_attachment: wfAttachment,
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
