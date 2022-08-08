<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <workflow-icon :size="36" :top-margin="false" :wf-type="workflow.type" />
      <div class="card-header" v-text="workflow.name" />
      <v-tooltip v-if="workflow.preRegistered" top>
        <template #activator="{ on }">
          <v-icon
            class="ml-2 mt-1"
            :color="$colors.indigo.darken1"
            v-on="on"
            v-text="'mdi-account-check-outline'"
          />
        </template>
        <span v-text="'Pre-registered workflow'" />
      </v-tooltip>
    </div>

    <v-data-table
      calculate-widths
      class="mx-12 mt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      :headers="workflowInfoHeaders"
      hide-default-footer
      hide-default-header
      item-key="key"
      :items="workflowInfoContents"
    >
      <template #[`item.value`]="{ item }">
        <a
          v-if="item.key === 'URL' && validUrl(item.value)"
          :href="item.value"
          v-text="item.value"
        />
        <span v-else v-text="item.value" />
      </template>
    </v-data-table>

    <div class="d-flex ml-12 mr-3 mt-2 pb-6">
      <codemirror
        class="elevation-2 content-viewer flex-grow-1"
        :options="{
          lineNumbers: true,
          mode: codeMirrorMode(workflow.content),
          tabSize: 2,
          readOnly: true,
        }"
        :style="{
          outline: `solid 1px ${$colors.grey.lighten1}`,
          maxWidth: '97%',
        }"
        :value="workflow.content"
      />
      <div class="d-flex flex-column ml-3">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-icon
              :color="$colors.grey.darken1"
              v-on="on"
              @click.stop="downloadWorkflowContent"
              v-text="'mdi-download'"
            />
          </template>
          <span v-text="'Download the workflow document'" />
        </v-tooltip>
        <v-tooltip v-model="copyTooltip" top>
          <template #activator="{ on }">
            <div class="mt-2" v-on="on">
              <v-icon
                :color="$colors.grey.darken1"
                @click.stop="copyWorkflowContent"
                v-text="'mdi-clipboard-outline'"
              />
            </div>
          </template>
          <span v-text="copied ? 'Copied!!' : 'Copy the workflow document'" />
        </v-tooltip>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import { codemirror } from 'vue-codemirror'
import { DataTableHeader } from 'vuetify/types'
import { defineComponent } from 'vue'
import { codeMirrorMode, validUrl } from '@/utils'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import WorkflowIcon from '@/components/WorkflowIcon.vue'

export default defineComponent({
  components: {
    codemirror,
    WorkflowIcon,
  },

  props: {
    workflowId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      workflowInfoHeaders: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' },
      ] as DataTableHeader[],
      copyTooltip: false,
      copied: false,
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.workflow.serviceId)
    },

    workflow(): Workflow {
      return this.$store.getters['workflows/workflow'](this.workflowId)
    },

    workflowInfoContents(): { key: string; value: string }[] {
      return [
        { key: 'URL', value: this.workflow.url },
        {
          key: this.workflow.preRegistered ? 'Updated Date' : 'Added Date',
          value: this.workflow.preRegistered
            ? this.$dayjs(this.workflow.updatedDate)
                .local()
                .format('YYYY-MM-DD HH:mm:ss')
            : this.$dayjs(this.workflow.addedDate)
                .local()
                .format('YYYY-MM-DD HH:mm:ss'),
        },
      ]
    },
  },

  methods: {
    validUrl(val: string): ReturnType<typeof validUrl> {
      return validUrl(val)
    },

    codeMirrorMode(content: string): ReturnType<typeof codeMirrorMode> {
      return codeMirrorMode(content)
    },

    copyWorkflowContent(): void {
      this.copyTooltip = false
      this.$copyText(this.workflow.content)
      setTimeout(() => {
        this.copyTooltip = true
        this.copied = true
        setTimeout(() => {
          this.copyTooltip = false
          setTimeout(() => {
            this.copied = false
          }, 300)
        }, 1000)
      }, 300)
    },

    downloadWorkflowContent(): void {
      const blob = new Blob([this.workflow.content], { type: 'text/plane' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = this.workflow.url.split('/').slice(-1)[0]
      link.href = url
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  },
})
</script>

<style scoped>
.content-viewer >>> .CodeMirror {
  height: 250px !important;
}
.content-viewer >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
.info-table >>> td:nth-child(1) {
  width: 270px;
  font-weight: 500;
}
.info-table >>> tr:not(:last-child) td {
  border-bottom: none !important;
}
</style>
