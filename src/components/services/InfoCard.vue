<template>
  <v-card v-if="service" ref="card" elevation="8" max-width="1200">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="service.name" />
      <v-chip
        v-for="(wes_version, i) in service.serviceInfo.supported_wes_versions"
        :key="i"
        :class="[i === 0 ? 'ml-4' : 'ml-2']"
        :color="$colors.indigo.lighten1"
        label
        small
        text-color="white"
        v-text="`WES ${wes_version}`"
      />
      <v-spacer />
      <v-chip
        :color="$store.getters['services/stateColor'](service.id)"
        class="mr-4"
        text-color="white"
        v-text="service.state"
      />
      <v-btn
        :color="$colors.grey.darken2"
        outlined
        small
        @click.stop="reloadServiceState"
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </div>

    <v-data-table
      :headers="serviceInfoHeaders"
      :items="serviceInfoContents"
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
        <a v-if="validUrl(item.value)" :href="item.value">{{ item.value }}</a>
        <div v-else v-text="item.value" />
      </template>
    </v-data-table>
    <div class="mx-12">
      <v-tabs v-model="tab" vertical height="332">
        <v-tab
          v-for="tabItem in tabItems"
          :key="tabItem.key"
          :style="{
            textTransform: 'none',
            justifyContent: 'start',
            letterSpacing: 'normal',
          }"
          v-text="tabItem.key"
        />
        <v-tab-item v-for="tabItem in tabItems" :key="tabItem.key">
          <codemirror
            ref="codeMirror"
            :options="{
              lineNumbers: true,
              mode: codeMirrorMode(tabItem.value),
              readOnly: true,
              tabSize: 2,
            }"
            :style="{
              outline: `solid 1px ${$colors.grey.lighten1}`,
            }"
            :value="tabItem.value"
            class="ml-6 mr-1 mt-2 mb-6 elevation-2 content-viewer"
          />
        </v-tab-item>
      </v-tabs>
    </div>
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
import dayjs from 'dayjs'
import Vue from 'vue'

type Data = {
  serviceInfoHeaders: DataTableHeader[]
  tab: number | null
}

type Methods = {
  reloadServiceState: () => Promise<void>
  codeMirrorMode: (content: string) => ReturnType<typeof codeMirrorMode>
  validUrl: (val: string) => ReturnType<typeof validUrl>
}

type Computed = {
  service: Service
  serviceInfoContents: { key: string; value: string }[]
  tabItems: {
    key: string
    value: string
  }[]
}

type Props = {
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
    serviceId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      serviceInfoHeaders: [
        { text: 'Key', value: 'key' },
        { text: 'Value', value: 'value' },
      ],
      tab: 1,
    }
  },

  computed: {
    service() {
      return this.$store.getters['services/service'](this.serviceId)
    },

    serviceInfoContents() {
      return [
        {
          key: 'Service Endpoint',
          value: this.service.endpoint,
        },
        {
          key: 'Added Date',
          value: dayjs(this.service.addedDate).format('YYYY-MM-DD hh:mm:ss'),
        },
        {
          key: 'Auth Instructions URL',
          value: this.service.serviceInfo?.auth_instructions_url || '',
        },
        {
          key: 'Contact Info URL',
          value: this.service.serviceInfo?.contact_info_url || '',
        },
      ]
    },

    tabItems() {
      return [
        {
          key: 'Workflow Type Versions',
          value: JSON.stringify(
            this.service?.serviceInfo?.workflow_type_versions || '',
            null,
            2
          ),
        },
        {
          key: 'Workflow Engine Versions',
          value: JSON.stringify(
            this.service?.serviceInfo?.workflow_engine_versions || '',
            null,
            2
          ),
        },
        {
          key: 'Default Workflow Engine Parameters',
          value: JSON.stringify(
            this.service?.serviceInfo?.default_workflow_engine_parameters || '',
            null,
            2
          ),
        },
        {
          key: 'Supported Filesystem Protocols',
          value: JSON.stringify(
            this.service?.serviceInfo?.supported_filesystem_protocols || '',
            null,
            2
          ),
        },
        {
          key: 'Tags',
          value: JSON.stringify(this.service?.serviceInfo?.tags || '', null, 2),
        },
      ]
    },
  },

  methods: {
    async reloadServiceState(): Promise<void> {
      await this.$store.dispatch('services/updateServiceState', this.serviceId)
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    validUrl(val) {
      return validUrl(val)
    },
  },

  filters: {
    jsonStringfy(jsonObj: ReturnType<typeof JSON.parse>): string {
      return JSON.stringify(jsonObj)
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
.info-table >>> td:nth-child(1) {
  width: 270px;
  font-weight: 500;
}
</style>
