<template>
  <v-dialog
    overlay-opacity="0.8"
    :value="dialogShow"
    width="900"
    @click:outside="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <v-card>
      <div class="d-flex align-center mx-6 pt-4">
        <v-icon color="black" left v-text="'mdi-sticker-plus-outline'" />
        <div class="card-header" v-text="'Add Workflow'" />
      </div>
      <div class="mx-12 my-2">
        <v-text-field
          v-if="inspected"
          v-model="name"
          hint="Name of the workflow (free text, e.g., 'Test workflow,' etc.)"
          label="Name"
          :persistent-hint="!name.length"
          placeholder="Type a name"
          :rules="nameRules"
        />
        <v-select
          v-if="inspected"
          v-model="type"
          hint="Select the workflow language type"
          :items="types"
          label="Type"
          :persistent-hint="!type.length"
          :rule="typeRules"
          @change="changeType"
        />
        <v-select
          v-if="inspected"
          v-model="version"
          :disabled="!type"
          hint="Select the workflow language version"
          :items="versions"
          label="Version"
          :persistent-hint="!type.length"
          :rules="versionRules"
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
            color="primary"
            mandatory
          >
            <v-chip label outlined :value="'fetch'">
              <v-icon left v-text="'mdi-download-outline'" />
              <span v-text="'Fetch'" />
            </v-chip>
            <v-chip label outlined :value="'upload'">
              <v-icon left v-text="'mdi-upload-outline'" />
              <span v-text="'Upload'" />
            </v-chip>
          </v-chip-group>
        </div>
        <div v-if="locationMode === 'fetch'" class="ml-4 d-flex flex-column">
          <v-text-field
            v-model="url"
            class="ma-0"
            hint="Network reachable location of the workflow document"
            label="URL"
            :persistent-hint="!url.length"
            placeholder="Type a URL"
            :rules="urlRules"
            @input="changeUrl"
          />
          <codemirror
            v-if="wfContentFetch.length"
            v-model="wfContentFetch"
            class="elevation-2 content-viewer"
            :options="{
              lineNumbers: true,
              tabSize: 2,
              mode: codeMirrorMode(wfContentFetch),
              readOnly: true,
            }"
            :style="{
              outline: `solid 1px ${$colors.grey.lighten1}`,
            }"
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
            class="ma-0"
            hint="The name of workflow document when it is placed in the execution directory and passed to the workflow engine"
            label="File Name"
            :persistent-hint="!fileName.length"
            placeholder="Type a file name"
            :rules="fileNameRules"
          />
          <div @drop="setDragFileName">
            <codemirror
              v-model="wfContentUpload"
              class="elevation-2 content-viewer"
              :options="{
                lineNumbers: true,
                tabSize: 2,
                mode: codeMirrorMode(wfContentUpload),
                readOnly: false,
              }"
              :style="{
                outline: `solid 1px ${$colors.grey.lighten1}`,
              }"
            />
          </div>
        </div>
      </div>
      <div class="d-flex justify-end align-center mx-12 pb-6 mt-4">
        <v-tooltip
          v-if="locationMode === 'fetch' && wfContentFetch.length"
          max-width="400"
          top
        >
          <template #activator="{ on }">
            <div class="mr-6" v-on="on">
              <v-checkbox
                v-model="attachAsFile"
                class="ma-0 pa-0"
                hide-details
                :label="'Attach as File'"
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
          color="primary"
          :disabled="!(registerValid && submitButton)"
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
import { defineComponent } from 'vue'
import { codeMirrorMode, validUrl, convertGitHubUrl } from '@/utils'
import { WorkflowLanguages, Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import { WesVersions, parseWorkflow } from '@/utils/WESRequest'

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
    service(): Service {
      return this.$store.getters['services/service'](this.serviceId)
    },

    wesVersion(): WesVersions {
      return this.$store.getters['services/wesVersion'](this.serviceId)
    },

    inspected(): boolean {
      if (this.wesVersion === 'sapporo-1.0.1') {
        if (this.wfContentFetch || this.wfContentUpload) {
          return true
        } else {
          return false
        }
      }
      return true
    },

    wfNames(): string[] {
      return this.$store.getters['workflows/workflowsByIds'](
        this.service.workflowIds
      ).map((workflow: Workflow) => workflow.name)
    },

    types(): string[] {
      const languages: WorkflowLanguages = this.$store.getters[
        'services/workflowLanguages'
      ](this.serviceId)
      const types = languages.map((language) => language.name)
      if (types.length === 1) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.type = types[0]
      }
      return languages.map((language) => language.name)
    },

    versions(): string[] {
      const languages: WorkflowLanguages = this.$store.getters[
        'services/workflowLanguages'
      ](this.serviceId)
      for (const language of languages) {
        if (language.name === this.type) {
          const versions = language.versions
          if (versions.length === 1) {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.version = versions[0]
          }
          return versions
        }
      }
      return []
    },

    registerValid(): boolean {
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

    nameRules(): string[] {
      if (!this.name) {
        return ['Required']
      }
      if (this.wfNames.includes(this.name)) {
        return ['Typed name already exists']
      }
      return []
    },

    typeRules(): string[] {
      if (!this.type) {
        return ['Required']
      }
      return []
    },

    versionRules(): string[] {
      if (!this.version) {
        return ['Required']
      }
      return []
    },

    urlRules(): string[] {
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

    fileNameRules(): string[] {
      if (this.locationMode === 'upload') {
        if (!this.fileName) {
          return ['Required']
        }
      }
      return []
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

    wfContentUpload() {
      if (this.wesVersion === 'sapporo-1.0.1') {
        if (this.wfContentUpload) {
          // inspect workflow
          if (!this.inspected) {
            parseWorkflow(this.service.endpoint, {
              workflow_content: this.wfContentUpload,
              types_of_parsing: ['workflow_type', 'workflow_type_version'],
            })
              .then((result) => {
                this.type = result.workflow_type || ''
                this.version = result.workflow_type_version || ''
              })
              .catch((_) => {
                this.type = ''
                this.version = ''
              })
          }
        }
      }
    },

    dialogShow() {
      this.dialogShowModel = this.dialogShow
    },
  },

  methods: {
    changeType(): void {
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

    changeUrl(): void {
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

    fetchWfContent(url: string): void {
      if (validUrl(url)) {
        convertGitHubUrl(this.url).then((url) => {
          this.url = url
          // inspect workflow
          if (this.wesVersion === 'sapporo-1.0.1') {
            parseWorkflow(this.service.endpoint, {
              workflow_location: url,
              types_of_parsing: ['workflow_type', 'workflow_type_version'],
            })
              .then((result) => {
                this.type = result.workflow_type || ''
                this.version = result.workflow_type_version || ''
              })
              .catch((_) => {
                this.type = ''
                this.version = ''
              })
          }
          fetch(this.url)
            .then((res) => {
              if (!res.ok) {
                this.fetchFailed = true
                this.wfContentFetch = ''
              } else {
                res.text().then((content) => {
                  this.fetchFailed = false
                  this.wfContentFetch = content
                  // add for name auto complete
                  if (!this.name) {
                    this.name = (this.url.split('/').pop() || '').replace(
                      /\.[^/.]+$/,
                      ''
                    )
                  }
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

    setDragFileName(e: DragEvent): void {
      if (e?.dataTransfer?.files?.[0]?.name) {
        this.fileName = e?.dataTransfer?.files[0].name
        // add for name auto complete
        if (!this.name) {
          this.name = (this.fileName.split('/').pop() || '').replace(
            /\.[^/.]+$/,
            ''
          )
        }
      }
    },

    submitWorkflow(): void {
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

    codeMirrorMode(content: string): ReturnType<typeof codeMirrorMode> {
      return codeMirrorMode(content)
    },
  },
})
</script>

<style scoped>
.content-viewer >>> .CodeMirror {
  height: 300px !important;
}
.content-viewer >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
</style>
