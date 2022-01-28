<template>
  <v-card v-if="service" ref="card" max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-dns-outline'" />
      <div class="card-header" v-text="service.name" />
      <v-tooltip v-if="service.preRegistered" top>
        <template #activator="{ on }">
          <v-icon
            :color="$colors.indigo.darken1"
            class="ml-2 mt-1"
            v-on="on"
            v-text="'mdi-account-check-outline'"
          />
        </template>
        <span v-text="'Pre-registered WES service'" />
      </v-tooltip>
      <v-spacer />
      <v-chip
        :color="$store.getters['services/stateColor'](service.id)"
        class="mr-4"
        text-color="white"
        v-text="service.state"
      />
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            :color="$colors.grey.darken2"
            outlined
            small
            @click.stop="reloadService"
            v-on="on"
          >
            <v-icon v-text="'mdi-reload'" />
          </v-btn>
        </template>
        <span v-text="'Reload WES service'" />
      </v-tooltip>
    </div>

    <v-data-table
      :headers="serviceInfoHeaders"
      :items="serviceInfoContents"
      calculate-widths
      class="mx-12 mt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      hide-default-footer
      hide-default-header
      item-key="key"
    >
      <template #[`item.value`]="{ item }">
        <span v-text="item.value" />
      </template>
    </v-data-table>
    <div class="mx-12">
      <v-tabs v-model="tab" vertical height="282">
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
              readOnly: 'nocursor',
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
import { DataTableHeader } from 'vuetify/types'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { Service } from '@/store/services'
import { codeMirrorMode, validUrl } from '@/utils'

type Data = {
  serviceInfoHeaders: DataTableHeader[]
  tab: number | null
}

type Methods = {
  reloadService: () => Promise<void>
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
          value: this.$dayjs(this.service.addedDate)
            .local()
            .format('YYYY-MM-DD HH:mm:ss'),
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
            this.service?.serviceInfo?.supported_filesystem_protocols ||
              this.service?.serviceInfo?.supported_filesystem_protocols ||
              '',
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
    async reloadService(): Promise<void> {
      await this.$store.dispatch('services/updateService', this.serviceId)
    },

    codeMirrorMode(content) {
      return codeMirrorMode(content)
    },

    validUrl(val) {
      return validUrl(val)
    },
  },
}

export default Vue.extend(options)
</script>

<style scoped>
.content-viewer >>> .CodeMirror {
  height: 250px !important;
  font-size: 0.9rem !important;
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
