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
        <div class="card-header" v-text="'Add Workflow'" />
      </div>
      <div class="mx-12 my-2">
        <v-text-field
          v-model="name"
          :persistent-hint="!name.length"
          :rules="nameRules"
          hint="Name of the workflow (free text, e.g., 'Test workflow,' etc.)"
          label="Name"
          placeholder="Type a name"
        />
        <v-select
          v-model="type"
          :items="types"
          :persistent-hint="!type.length"
          :rule="typeRules"
          hint="Select the workflow language type"
          label="Type"
          @change="changeType"
        />
        <v-select
          v-model="version"
          :disabled="!type"
          :items="versions"
          :persistent-hint="!type.length"
          :rules="versionRules"
          hint="Select the workflow language version"
          label="Version"
        />
      </div>
      <div class="mx-12 mt-2">
        <div class="d-flex align-center">
          <span
            :style="{ color: `${$colors.grey.darken2}` }"
            v-text="'Document'"
          />
          <v-chip-group
            v-model="locationMode"
            class="ml-6"
            mandatory
            color="primary"
          >
            <v-chip :value="'fetch'" label outlined>
              <v-icon left v-text="'mdi-download-outline'" />
              <span v-text="'Fetch'" />
            </v-chip>
            <v-chip :value="'upload'" label outlined>
              <v-icon left v-text="'mdi-upload-outline'" />
              <span v-text="'Upload'" />
            </v-chip>
          </v-chip-group>
        </div>
        <div v-if="locationMode === 'fetch'" class="ml-4 d-flex flex-column">
          <v-text-field
            v-model="url"
            :persistent-hint="!url.length"
            :rules="urlRules"
            class="ma-0"
            hint="Network reachable location of the workflow document"
            label="URL"
            placeholder="Type a URL"
            @input="changeUrl"
          />
          <codemirror
            v-if="wfContentFetch.length"
            v-model="wfContentFetch"
            :options="{
              lineNumbers: true,
              tabSize: 2,
              mode: codeMirrorMode(wfContentFetch),
              readOnly: 'nocursor',
            }"
            :style="{
              outline: `solid 1px ${$colors.grey.lighten1}`,
            }"
            class="elevation-2 content-viewer"
          />
        </div>
        <div
          v-else-if="locationMode === 'upload'"
          class="ml-4 d-flex flex-column"
        >
          <div v-if="!wfContentUpload.length" class="mb-2">
            <span
              :style="{ color: `${$colors.grey.darken2}`, fontSize: '0.9rem' }"
              v-text="
                'Drag-and-Drop or Copy-and-Paste the document into the box below.'
              "
            />
          </div>
          <v-text-field
            v-if="wfContentUpload.length"
            v-model="fileName"
            :persistent-hint="!fileName.length"
            :rules="fileNameRules"
            class="ma-0"
            hint="The name of workflow document when it is placed in the execution directory and passed to the workflow engine"
            label="File Name"
            placeholder="Type a file name"
          />
          <div @drop="setDragFileName">
            <codemirror
              v-model="wfContentUpload"
              :options="{
                lineNumbers: true,
                tabSize: 2,
                mode: codeMirrorMode(wfContentUpload),
                readOnly: false,
              }"
              :style="{
                outline: `solid 1px ${$colors.grey.lighten1}`,
              }"
              class="elevation-2 content-viewer"
            />
          </div>
        </div>
      </div>
      <div class="d-flex justify-end align-center mx-12 pb-6 mt-4">
        <v-tooltip
          v-if="locationMode === 'fetch' && wfContentFetch.length"
          top
          max-width="400"
        >
          <template #activator="{ on }">
            <div class="mr-6" v-on="on">
              <v-checkbox
                v-model="attachAsFile"
                hide-details
                :label="'Attach as File'"
                class="ma-0 pa-0"
              />
            </div>
          </template>
          <span
            v-text="
              'Check this box if you want to place the workflow document in the execution directory and pass it as a local path, instead of passing the remote URL directly to the workflow engine.'
            "
          />
        </v-tooltip>
        <v-btn
          :disabled="!(registerValid && submitButton)"
          color="primary"
          outlined
          @click.stop="submitWorkflow"
        >
          <v-icon left v-text="'mdi-arrow-up'" />
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
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { codeMirrorMode, validUrl, convertGitHubUrl } from '@/utils'
import { WorkflowLanguages, Service } from '@/store/services'
import { Workflow } from '@/store/workflows'

const changeQueue: NodeJS.Timeout[] = []

type Data = {
  name: string
  type: string
  version: string
  locationMode: string
  url: string
  fetchFailed: boolean
  wfContentFetch: string
  attachAsFile: boolean
  wfContentUpload: string
  fileName: string
  submitButton: boolean
}

type Methods = {
  changeType: () => void
  changeUrl: () => void
  fetchWfContent: (url: string) => void
  setDragFileName: (e: DragEvent) => void
  submitWorkflow: () => void
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
}

type Computed = {
  service: Service
  wfNames: string[]
  types: string[]
  versions: string[]
  registerValid: boolean
  nameRules: string[]
  typeRules: string[]
  versionRules: string[]
  urlRules: string[]
  fileNameRules: string[]
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
      locationMode: 'fetch',
      url: '',
      fetchFailed: false,
      wfContentFetch: '',
      attachAsFile: false,
      wfContentUpload: '',
      fileName: '',
      submitButton: true,
    }
  },

  computed: {
    service() {
      return this.$store.getters['services/service'](this.serviceId)
    },

    wfNames() {
      return this.$store.getters['workflows/workflowsByIds'](
        this.service.workflowIds
      ).map((workflow: Workflow) => workflow.name)
    },

    types() {
      const languages: WorkflowLanguages = this.$store.getters[
        'services/workflowLanguages'
      ](this.serviceId)
      const types = languages.map((language) => language.name)
      if (types.length === 1) {
        this.type = types[0]
      }
      return languages.map((language) => language.name)
    },

    versions() {
      const languages: WorkflowLanguages = this.$store.getters[
        'services/workflowLanguages'
      ](this.serviceId)
      for (const language of languages) {
        if (language.name === this.type) {
          const versions = language.versions
          if (versions.length === 1) {
            this.version = versions[0]
          }
          return versions
        }
      }
      return []
    },

    registerValid() {
      const content =
        this.locationMode === 'fetch'
          ? !!this.wfContentFetch.length
          : !!this.wfContentUpload.length
      return (
        !this.nameRules.length &&
        !this.typeRules.length &&
        !this.versionRules.length &&
        !this.urlRules.length &&
        !this.fileNameRules.length &&
        content
      )
    },

    nameRules() {
      if (!this.name) {
        return ['Required']
      }
      if (this.wfNames.includes(this.name)) {
        return ['Typed name already exists']
      }
      return []
    },

    typeRules() {
      if (!this.type) {
        return ['Required']
      }
      return []
    },

    versionRules() {
      if (!this.version) {
        return ['Required']
      }
      return []
    },

    urlRules() {
      if (this.locationMode === 'fetch') {
        if (!this.url) {
          return ['Required']
        }
        if (!validUrl(this.url)) {
          return ['Invalid URL']
        }
        if (this.fetchFailed) {
          return ['Failed to get the workflow content from the entered URL']
        }
      }
      return []
    },

    fileNameRules() {
      if (this.locationMode === 'upload') {
        if (!this.fileName) {
          return ['Required']
        }
      }
      return []
    },
  },

  methods: {
    changeType() {
      if (this.type) {
        if (this.versions.length === 1) {
          this.version = this.versions[0]
        } else {
          this.version = ''
        }
      } else {
        this.version = ''
      }
    },

    changeUrl() {
      while (changeQueue.length) {
        const timeoutId = changeQueue.shift()
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
      const eventId = setTimeout(
        (url) => {
          this.fetchWfContent(url)
        },
        1000,
        this.url
      )
      changeQueue.push(eventId)
    },

    fetchWfContent(url: string) {
      if (validUrl(url)) {
        convertGitHubUrl(this.url).then((url) => {
          this.url = url
          fetch(this.url)
            .then((res) => {
              if (!res.ok) {
                this.fetchFailed = true
                this.wfContentFetch = ''
              } else {
                res.text().then((content) => {
                  this.fetchFailed = false
                  this.wfContentFetch = content
                })
              }
            })
            .catch((_) => {
              this.fetchFailed = true
              this.wfContentFetch = ''
            })
        })
      } else {
        this.wfContentFetch = ''
      }
    },

    setDragFileName(e: DragEvent) {
      if (e?.dataTransfer?.files?.[0]?.name) {
        this.fileName = e?.dataTransfer?.files[0].name
      }
    },

    submitWorkflow() {
      if (this.registerValid) {
        this.submitButton = false
        let url = ''
        if (this.locationMode === 'fetch') {
          if (this.attachAsFile) {
            const tmpUrl = new URL(this.url)
            url = tmpUrl.pathname.split('/').pop() || this.url
          } else {
            url = this.url
          }
        } else {
          url = this.fileName
        }
        this.$store
          .dispatch('workflows/submitWorkflow', {
            serviceId: this.serviceId,
            name: this.name,
            type: this.type,
            version: this.version,
            url,
            content:
              this.locationMode === 'fetch'
                ? this.wfContentFetch
                : this.wfContentUpload,
            preRegistered: false,
          })
          .then((workflowId) => {
            this.$emit('close')
            this.$router.push({ path: '/workflows', query: { workflowId } })
          })
      }
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },
  },

  watch: {
    type() {
      if (this.type === 'CWL') {
        this.attachAsFile = false
      } else {
        this.attachAsFile = true
      }
    },

    url() {
      if (!this.name) {
        this.name = (this.url.split('/').pop() || '').replace(/\.[^/.]+$/, '')
      }
    },

    fileName() {
      if (!this.name) {
        this.name = (this.fileName.split('/').pop() || '').replace(
          /\.[^/.]+$/,
          ''
        )
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
.content-viewer >>> .CodeMirror-gutter-wrapper {
  left: -30px !important;
}
</style>
