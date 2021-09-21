<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="900"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header mx-6 pt-4" v-text="'Import Run'" />
      <div class="mx-12 my-2">
        <v-text-field
          v-model="runId"
          :error-messages="runIdError || checkRunExistMessage"
          clearable
          label="Run ID"
          @change="
            checkRunExistMessage =
              'Move to the next field to check if the run exists'
          "
          @blur="checkRunExist"
        />
        <v-text-field
          v-model="runName"
          :error-messages="runNameError"
          clearable
          label="Run Name"
          :disabled="!runLog"
        />
        <v-text-field
          v-model="workflowName"
          :error-messages="workflowNameError"
          clearable
          label="Workflow Name"
          :disabled="!runLog"
        />
        <v-select
          v-model="workflowType"
          :disabled="!runLog"
          :error-messages="workflowTypeError"
          :items="workflowTypes"
          clearable
          label="Workflow Type"
          @change="changeWorkflowType"
        />
        <v-select
          v-model="workflowVersion"
          :disabled="!runLog || !workflowType"
          :error-messages="workflowVersionError"
          :items="workflowVersions"
          clearable
          label="Workflow Version"
        />
        <v-text-field
          :value="workflowUrl"
          :disabled="!runLog"
          label="Workflow URL (read-only)"
          readonly
        />
        <codemirror
          v-model="workflowContent"
          :options="{
            lineNumbers: true,
            tabSize: 2,
            mode: codeMirrorMode(workflowContent),
            readOnly: true,
          }"
          :style="{
            outline: `solid 1px ${$colors.grey.lighten1}`,
          }"
          class="mt-4 mx-4 mb-2 elevation-2 content-viewer"
        />
      </div>
      <div class="d-flex justify-end mx-12 pb-6">
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
import { RunLog } from '@/types/WES'
import { Run } from '@/store/runs'
import { Workflow } from '@/store/workflows'

type Data = {
  runId: string
  checkRunExistMessage: string
  runLog: RunLog | undefined
  runName: string
  workflowName: string
  workflowType: string
  workflowVersion: string
  workflowUrl: string
  workflowContent: string
}

type Methods = {
  checkRunExist: () => Promise<void>
  changeWorkflowType: () => void
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
  importRun: () => Promise<void>
}

type Computed = {
  service: Service
  workflows: Workflow[]
  runs: Run[]
  formValid: boolean
  runIdError: string
  runNameError: string
  workflowNameError: string
  workflowTypes: string[]
  workflowTypeError: string
  workflowVersions: string[]
  workflowVersionError: string
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
      checkRunExistMessage: 'Move to the next field to check if the run exists',
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

    runs() {
      return this.$store.getters['runs/runsByIds'](this.service.runIds)
    },

    formValid() {
      return (
        !this.runIdError &&
        !this.checkRunExistMessage &&
        !this.runNameError &&
        !this.workflowTypeError &&
        !this.workflowVersionError
      )
    },

    runIdError() {
      if (!this.runId) {
        return 'Required'
      }
      if (this.runs.map((run) => run.id).includes(this.runId)) {
        return `Run ID: ${this.runId} already exists in this service.`
      }
      return ''
    },

    runNameError() {
      if (!this.runName) {
        return 'Required'
      }
      if (this.runs.map((run) => run.name).includes(this.runName)) {
        return `Run name: ${this.runName} already exists in this service.`
      }
      return ''
    },

    workflowNameError() {
      if (!this.workflowName) {
        return 'Required'
      }
      if (
        this.workflows
          .map((workflow) => workflow.name)
          .includes(this.workflowName)
      ) {
        return `Workflow name: ${this.workflowName} already exists in this service.`
      }
      return ''
    },

    workflowTypes() {
      return this.$store.getters['services/workflowLanguages'](
        this.serviceId
      ).map((lang: { name: string; versions: string[] }) => lang.name)
    },

    workflowVersions() {
      return (
        (
          this.$store.getters['services/workflowLanguages'](
            this.serviceId
          ).filter(
            (lang: { name: string; versions: string[] }) =>
              lang.name === this.workflowType
          ) as { name: string; versions: string[] }[]
        )?.[0]?.versions || []
      )
    },

    workflowTypeError() {
      if (!this.workflowType) {
        return 'Required'
      }
      if (!this.workflowTypes.includes(this.workflowType)) {
        return `Workflow type: ${this.workflowType} is not supported by this service.`
      }
      return ''
    },

    workflowVersionError() {
      if (!this.workflowVersion) {
        return 'Required'
      }
      if (!this.workflowVersions.includes(this.workflowVersion)) {
        return `Workflow version: ${this.workflowVersion} is not supported by this service.`
      }
      return ''
    },
  },

  methods: {
    async checkRunExist() {
      await getRunsId(this.$axios, this.service.endpoint, this.runId)
        .then(async (runLog) => {
          this.checkRunExistMessage = ''
          this.runLog = runLog
          this.workflowName =
            runLog.request.workflow_name ||
            runLog.request.workflow_url.split('/').slice(-1)[0]
          this.runName = `${this.workflowName} ${this.$dayjs
            .utc(runLog.run_log.start_time)
            .local()
            .format('YYYY-MM-DD HH:mm:ss')}`
          this.workflowType = runLog.request.workflow_type
          this.workflowVersion = runLog.request.workflow_type_version
          this.workflowUrl = runLog.request.workflow_url
          this.workflowContent = 'Failed to retrieve workflow content'
          if (validUrl(this.workflowUrl)) {
            this.workflowUrl = await convertGitHubUrl(
              this.$axios,
              this.workflowUrl
            )
            const res = await this.$axios.$get(this.workflowUrl)
            if (typeof res === 'string') {
              this.workflowContent = res
            } else {
              this.workflowContent = JSON.stringify(res, null, 2)
            }
          } else {
            const fileName = this.workflowUrl.split('/').slice(-1)[0]
            for (const file of runLog.request.workflow_attachment || []) {
              const attachedFileName = file.file_name.split('/').slice(-1)[0]
              if (fileName === attachedFileName) {
                const res = await this.$axios.$get(file.file_url)
                if (typeof res === 'string') {
                  this.workflowContent = res
                } else {
                  this.workflowContent = JSON.stringify(res, null, 2)
                }
                break
              }
            }
          }
        })
        .catch((_) => {
          this.checkRunExistMessage = `Invalid Run ID: GET runs/${this.runId}/status not responding`
          this.runLog = undefined
        })
    },

    changeWorkflowType() {
      if (this.workflowType) {
        if (this.workflowVersions.length === 1) {
          this.workflowVersion = this.workflowVersions[0]
        } else {
          this.workflowVersion = ''
        }
      } else {
        this.workflowVersion = ''
      }
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    async importRun() {
      if (this.formValid) {
        const workflowId: string = await this.$store.dispatch(
          'workflows/addWorkflow',
          {
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
          }
        )
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
        this.$router.push({ path: '/runs', query: { runId: this.runId } })
      }
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
</style>
