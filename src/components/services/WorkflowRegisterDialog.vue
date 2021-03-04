<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="900"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header pl-6 pt-4" v-text="'Register Workflow'" />
      <div class="px-12 py-2">
        <v-text-field
          v-model="name"
          :error-messages="nameError"
          clearable
          label="Name"
        />
        <v-select
          v-model="type"
          :error-messages="typeError"
          :items="types"
          clearable
          label="Type"
          @change="changeType"
        />
        <v-select
          v-model="version"
          :items="versions"
          :error-messages="versionError"
          clearable
          label="Version"
        />
        <v-text-field
          v-model="url"
          :error-messages="urlError"
          clearable
          hint="Please enter the HTTP/HTTPS remote URL, or enter the content of the workflow in the text area below, or drag and drop a file into the text area below."
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
            v-text="'Unable to edit because a remote URL has been entered.'"
          />
          <v-btn
            :color="$colors.grey.darken2"
            class="mr-4"
            outlined
            @click.stop="attachAsFile"
            v-text="'Attach as File'"
          />
        </div>
      </div>
      <div class="d-flex justify-end px-12 pb-6">
        <v-btn
          :disabled="!registerValid"
          color="primary"
          outlined
          @click.stop="submitWorkflow"
        >
          <v-icon class="mr-2" v-text="'mdi-arrow-up'" />
          <span v-text="'Submit'" />
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
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { WorkflowLanguages, Service } from '@/store/services'

import Vue from 'vue'

const boxInitialText =
  '  Please enter the contents of the workflow in the text area, or drag and drop the file.'

type Data = {
  name: string
  type: string
  version: string
  url: string
  wfContent: string
}

type Methods = {
  changeType: () => void
  blurUrl: () => Promise<void>
  fixCodemirrorCss: () => void
  submitWorkflow: () => Promise<void>
  setDragFileName: (e: DragEvent) => void
  attachAsFile: () => void
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
}

type Computed = {
  registerValid: boolean
  wfNames: string[]
  languages: WorkflowLanguages
  types: string[]
  versions: string[]
  nameError: string
  typeError: string
  versionError: string
  urlError: string
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
      name: '',
      type: '',
      version: '',
      url: '',
      wfContent: boxInitialText,
    }
  },

  computed: {
    wfNames() {
      const service: Service | undefined = this.$store.getters[
        'services/service'
      ](this.serviceId)
      if (service) {
        return this.$store.getters['workflows/workflowsByIds'](
          service.workflowIds
        )
      }
      return []
    },

    languages() {
      return this.$store.getters['services/workflowLanguages'](this.serviceId)
    },

    types() {
      return this.languages.map((language) => language.name)
    },

    versions() {
      let versions: string[] = []
      for (const language of this.languages) {
        if (language.name === this.type) {
          versions = language.versions
        }
      }
      return versions
    },

    registerValid() {
      return (
        !this.nameError &&
        !this.typeError &&
        !this.versionError &&
        !this.urlError
      )
    },

    nameError() {
      if (!this.name) {
        return 'Name is required.'
      }
      if (this.name in this.wfNames) {
        return `Name: ${this.name} already exists.`
      }
      return ''
    },

    typeError() {
      if (!this.type) {
        return 'Type is required.'
      }
      return ''
    },

    versionError() {
      if (!this.version) {
        return 'Version is required'
      }
      return ''
    },

    urlError() {
      if (this.url) {
        if (!this.wfContent || this.wfContent === boxInitialText) {
          return 'Please enter the content of the workflow in the text area below, or drag and drop a file into the text area below.'
        } else {
          // do nothing
        }
      } else if (!this.wfContent || this.wfContent === boxInitialText) {
        return 'Please enter the HTTP/HTTPS remote URL, or enter the content of the workflow in the text area below, or drag and drop a file into the text area below.'
      } else {
        return 'Please enter the File name. (e.g. workflow.cwl)'
      }
      return ''
    },

    isRemoteUrl(): boolean {
      return validUrl(this.url)
    },
  },

  methods: {
    changeType() {
      if (this.type && this.versions.length === 1) {
        this.version = this.versions[0]
      }
      if (!this.type) {
        this.version = ''
      }
    },

    async blurUrl() {
      if (this.isRemoteUrl) {
        this.url = await convertGitHubUrl(this.$axios, this.url)
        const res = await this.$axios.$get(this.url)
        if (typeof res === 'string') {
          this.wfContent = res
        } else {
          this.wfContent = JSON.stringify(res, null, 2)
        }
      }
    },

    fixCodemirrorCss() {
      if (this.wfContent === boxInitialText) {
        this.wfContent = ''
      }
    },

    setDragFileName(e: DragEvent) {
      this.wfContent = ''
      if (e?.dataTransfer?.files?.[0]?.name) {
        this.url = e?.dataTransfer?.files[0].name
      }
    },

    async submitWorkflow() {
      if (this.registerValid) {
        await this.$store
          .dispatch('workflows/submitWorkflow', {
            serviceId: this.serviceId,
            name: this.name,
            type: this.type,
            version: this.version,
            url: this.url,
            content: this.wfContent,
            preRegistered: false,
          })
          .then((workflowId) => {
            this.$emit('close')
            this.$router.push({ path: '/workflows', query: { workflowId } })
          })
      }
    },

    attachAsFile() {
      if (this.isRemoteUrl) {
        const url = new URL(this.url)
        this.url = url.pathname.split('/').slice(-1)[0]
      }
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },
  },

  mounted() {
    if (this.types.length === 1) {
      this.type = this.types[0]
    }
    if (this.versions.length === 1) {
      this.version = this.versions[0]
    }
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
