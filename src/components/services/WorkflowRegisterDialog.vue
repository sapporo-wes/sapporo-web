<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="900"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header pl-6 pt-4" v-text="'Register Workflow'" />
      <v-form
        ref="form"
        v-model="registerValid"
        class="px-12 py-2"
        lazy-validation
      >
        <v-text-field
          v-model="inputtedName"
          :rules="nameRules"
          clearable
          label="Name"
        />
        <v-select
          v-model="inputtedType"
          :items="types"
          :rules="[(v) => !!v || 'Type is required.']"
          clearable
          label="Type"
        />
        <v-select
          v-model="inputtedVersion"
          :items="versions"
          :rules="[(v) => !!v || 'Version is required.']"
          clearable
          label="Version"
        />
        <v-text-field
          v-model="inputtedUrl"
          :error-messages="urlErrorMessages"
          clearable
          hint="Please enter the HTTP/HTTPS URL, or enter the content of the workflow in the text area below, or drag and drop a file into the text area below."
          label="URL"
          persistent-hint
          @blur="blurUrl"
        />
        <div @drop="setDragFileName">
          <codemirror
            v-model="wfContent"
            :options="{
              lineNumbers: true,
              tabSize: 2,
              mode: codeMirrorMode(wfContent),
              readOnly: isRemoteUrl,
            }"
            :style="{
              outline: `solid 1px ${$colors.grey.lighten1}`,
            }"
            class="mt-4 mx-4 mb-2 elevation-2 content-viewer"
            @focus="fixCodemirrorCss"
          />
        </div>
        <div
          v-if="isRemoteUrl"
          class="d-flex align-center justify-space-between py-2"
        >
          <div
            class="mb-2 mx-4"
            v-text="'Cannot edit because a Remote URL has been entered.'"
          />
          <v-btn
            :color="$colors.grey.darken2"
            class="mr-4"
            outlined
            @click.stop="attachAsFile"
            v-text="'Attach as File'"
          />
        </div>
      </v-form>
      <div class="d-flex justify-end px-12 pb-6">
        <v-btn
          :disabled="!registerValid"
          color="primary"
          outlined
          @click.stop="submitWorkflow"
        >
          <v-icon class="mr-1">mdi-arrow-up</v-icon>Submit
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
import { codeMirrorMode, validUrl, convertGitHubUrl } from '@/utils'
import { Rule, FormComponent } from '@/types'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Workflow } from '@/store/workflows'
import Vue from 'vue'
import { WorkflowLanguages } from '@/store/services'

const boxInitialText =
  '  Enter the content of the workflow or drag and drop a file here.'

type Data = {
  registerValid: boolean
  inputtedName: string
  nameRules: Rule[]
  inputtedType: string
  inputtedVersion: string
  inputtedUrl: string
  wfContent: string
}

type Methods = {
  blurUrl: () => void
  fixCodemirrorCss: () => void
  submitWorkflow: () => Promise<void>
  setDragFileName: (e: DragEvent) => void
  attachAsFile: () => void
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
}

type Computed = {
  languages: WorkflowLanguages
  types: string[]
  versions: string[]
  urlErrorMessages: string | Array<boolean | string>
  isRemoteUrl: boolean
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
      registerValid: false,
      inputtedName: '',
      nameRules: [(v) => !!v || 'Name is required.'],
      inputtedType: '',
      inputtedVersion: '',
      inputtedUrl: '',
      wfContent: boxInitialText,
    }
  },

  created() {
    // TODO
    this.nameRules.push(
      (v) =>
        !this.$store.getters['workflows/workflows']
          .map((workflow: Workflow) => workflow.name)
          .includes(v) || `Workflow name ${v} already exists.`
    )
  },

  computed: {
    languages() {
      return this.$store.getters['services/workflowLanguages'](this.serviceId)
    },

    types() {
      return this.languages.map((language) => language.name)
    },

    versions() {
      let versions: string[] = []
      for (const language of this.languages) {
        if (language.name === this.inputtedType) {
          versions = language.versions
        }
      }
      return versions
    },

    urlErrorMessages() {
      if (!this.wfContent || this.wfContent === boxInitialText) {
        if (!this.inputtedUrl) {
          return 'Please enter the HTTP/HTTPS URL, or enter the content of the workflow in the text area below, or drag and drop a file into the text area below.'
        } else {
          return 'Please enter the content of the workflow in the text area below, or drag and drop a file into the text area below.'
        }
      } else if (!this.inputtedUrl) {
        return 'Please enter the File name. (e.g. workflow.cwl)'
      }
      return ''
    },

    isRemoteUrl(): boolean {
      return validUrl(this.inputtedUrl)
    },
  },

  methods: {
    async blurUrl(): Promise<void> {
      if (this.isRemoteUrl) {
        this.inputtedUrl = await convertGitHubUrl(this.$axios, this.inputtedUrl)
        const res = await this.$axios.$get(this.inputtedUrl)
        if (typeof res === 'string') {
          this.wfContent = res
        } else {
          this.wfContent = JSON.stringify(res, null, 2)
        }
      }
    },

    fixCodemirrorCss(): void {
      if (this.wfContent === boxInitialText) {
        this.wfContent = ''
      }
    },

    setDragFileName(e: DragEvent) {
      this.wfContent = ''
      if (e?.dataTransfer?.files?.[0]?.name) {
        this.inputtedUrl = e?.dataTransfer?.files[0].name
      }
    },

    async submitWorkflow(): Promise<void> {
      if (((this.$refs.form as unknown) as FormComponent).validate()) {
        await this.$store
          .dispatch('workflows/submitWorkflow', {
            serviceId: this.serviceId,
            name: this.inputtedName,
            type: this.inputtedType,
            version: this.inputtedVersion,
            url: this.inputtedUrl,
            content: this.wfContent,
            preRegistered: false,
          })
          .then((workflowId) => {
            ;((this.$refs.form as unknown) as FormComponent).reset()
            ;((this.$refs.form as unknown) as FormComponent).resetValidation()
            this.$router.push({ path: '/workflows', query: { workflowId } })
          })
      }
    },

    attachAsFile() {
      if (this.isRemoteUrl) {
        const url = new URL(this.inputtedUrl)
        const splitPath = url.pathname.split('/')
        this.inputtedUrl = splitPath[splitPath.length - 1]
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
.content-viewer >>> .CodeMirror {
  height: 300px !important;
  font-size: 0.9rem !important;
}
.content-viewer >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
</style>
