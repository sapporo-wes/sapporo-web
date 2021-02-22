<template>
  <v-card v-if="workflow" elevation="8" max-width="1200">
    <div class="card-header px-6 pt-4" v-text="workflow.name" />
    <v-data-table
      :headers="workflowInfoHeaders"
      :items="workflowInfoContents"
      calculate-widths
      class="mx-12 pt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      hide-default-footer
      hide-default-header
      item-key="key"
    >
      <template #[`item.value`]="{ item }">
        <nuxt-link
          v-if="item.key === 'Service'"
          :to="{ path: '/services', query: { serviceId: service.id } }"
          v-text="service.name"
        />
        <a
          v-else-if="item.key === 'Workflow URL' && validUrl(item.value)"
          :href="item.value"
          >{{ item.value }}</a
        >
        <div v-else v-text="item.value" />
      </template>
    </v-data-table>

    <codemirror
      :options="{
        lineNumbers: true,
        mode: codeMirrorMode(workflow.content),
        tabSize: 2,
        readOnly: true,
      }"
      :style="{
        outline: `solid 1px ${$colors.grey.lighten1}`,
      }"
      :value="workflow.content"
      class="mx-12 mt-6 elevation-2 content-viewer"
    />
    <div class="pt-6" />
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import { codemirror } from 'vue-codemirror'
import { codeMirrorMode, validUrl } from '@/utils'
import { DataTableHeader } from 'vuetify/types'
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Workflow } from '@/store/workflows'
import dayjs from 'dayjs'
import Vue from 'vue'

type Data = {
  workflowInfoHeaders: DataTableHeader[]
}

type Methods = {
  validUrl: (val: string) => ReturnType<typeof validUrl>
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
}

type Computed = {
  service: Service
  workflow: Workflow
  workflowInfoContents: {
    key: string
    value: string
  }[]
}

type Props = {
  workflowId: string
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
      ],
    }
  },

  computed: {
    workflow() {
      return this.$store.getters['workflows/workflow'](this.workflowId)
    },

    service() {
      return this.$store.getters['services/service'](this.workflow.serviceId)
    },

    workflowInfoContents() {
      return [
        { key: 'Service', value: '' },
        {
          key: 'Workflow Type Version',
          value: `${this.workflow.type} ${this.workflow.version}`,
        },
        { key: 'Workflow URL', value: this.workflow.url },
        {
          key: 'Added Date',
          value: dayjs(this.workflow.addedDate).format('YYYY-MM-DD hh:mm:ss'),
        },
      ]
    },
  },

  methods: {
    validUrl(val) {
      return validUrl(val)
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
  height: 400px !important;
  font-size: 0.9rem !important;
}
.content-viewer >>> .CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
.info-table >>> td:nth-child(1) {
  width: 220px;
  font-weight: 500;
}
</style>
