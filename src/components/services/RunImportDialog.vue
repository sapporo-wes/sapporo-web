<template>
  <v-dialog
    overlay-opacity="0.8"
    :value="dialogShow"
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
          class="ma-0"
          hint="Enter the Run ID included in this WES endpoint"
          label="Run ID"
          :persistent-hint="!runId.length"
          placeholder="Enter the Run ID"
          :rules="runIdRules"
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
            class="my-0 mr-auto"
            label="Workflow Type"
            readonly
            :style="{ maxWidth: '48%', minWidth: '48%' }"
          />

          <v-text-field
            v-if="!getFailed"
            v-model="workflowVersion"
            class="ma-0"
            label="Workflow Version"
            readonly
            :style="{ maxWidth: '48%', minWidth: '48%' }"
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
          class="elevation-2 content-viewer"
          :options="{
            lineNumbers: true,
            tabSize: 2,
            mode: codeMirrorMode(workflowContent),
            readOnly: true,
          }"
          :style="{
            outline: `solid 1px ${$colors.grey.lighten1}`,
          }"
        />
      </div>
      <div class="d-flex justify-end mx-12 pb-6 mt-4">
        <v-btn
          color="primary"
          :disabled="!formValid"
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
import { defineComponent } from 'vue'
import {
  codeMirrorMode,
  convertGitHubUrl,
  formatResponse,
  formatTime,
} from '@/utils'
import { fetchWorkflowContent, getRunsId } from '@/utils/WESRequest'
import { Service } from '@/store/services'
import { RunLog, AttachedFile } from '@/types/WES'
import { Workflow } from '@/store/workflows'

const changeQueue: NodeJS.Timeout[] = []

export default defineComponent({
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
      runLog: undefined as RunLog | undefined,
      runName: '',
      workflowName: '',
      workflowType: '',
      workflowVersion: '',
      workflowUrl: '',
      workflowContent: '',
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.serviceId)
    },

    workflows(): Workflow[] {
      return this.$store.getters['workflows/workflowsByIds'](
        this.service.workflowIds
      )
    },

    runIdRules(): string[] {
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

    formValid(): boolean {
      return !this.runIdRules.length
    },
  },

  methods: {
    changeRunId(): void {
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

    getRunsId(runId: string): void {
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
              const wfUrl = runLog.request.workflow_url || ''
              this.workflowName =
                runLog.request.workflow_name || wfUrl.split('/').pop() || runId
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
            const startTimeStr = formatTime(
              this.$dayjs,
              formatResponse(startTime)
            )

            this.runName = `${this.workflowName} ${startTimeStr}`
            this.workflowType = runLog.request.workflow_type
            this.workflowVersion = runLog.request.workflow_type_version
            let wfAttachment: AttachedFile[] = []
            if ('workflow_attachment' in runLog.request) {
              wfAttachment =
                JSON.parse(
                  formatResponse(runLog.request.workflow_attachment)
                ) || []
            }
            const wfUrl = formatResponse(runLog.request.workflow_url) || ''
            try {
              const newUrl = new URL(wfUrl)
              convertGitHubUrl(newUrl).then((url) => {
                this.workflowUrl = url
              })
            } catch (_) {
              // like `./trimming_and_qc.cwl`
              const fileName = wfUrl.split('/').pop() || wfUrl
              for (const file of wfAttachment) {
                if (file.file_name.includes(fileName)) {
                  this.workflowUrl = file.file_url
                  break
                }
              }
            }
            fetchWorkflowContent({
              workflow_name: this.workflowName,
              workflow_url: this.workflowUrl,
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

    clearState(): void {
      this.runLog = undefined
      this.runName = ''
      this.workflowName = ''
      this.workflowType = ''
      this.workflowVersion = ''
      this.workflowUrl = ''
      this.workflowContent = ''
    },

    codeMirrorMode(content: string): ReturnType<typeof codeMirrorMode> {
      return codeMirrorMode(content)
    },

    importRun(): void {
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
})
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
