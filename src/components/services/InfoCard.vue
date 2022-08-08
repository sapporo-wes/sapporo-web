<template>
  <v-card v-if="service" ref="card" max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-dns-outline'" />
      <div class="card-header" v-text="service.name" />
      <v-tooltip v-if="service.preRegistered" top>
        <template #activator="{ on }">
          <v-icon
            class="ml-2 mt-1"
            :color="$colors.indigo.darken1"
            v-on="on"
            v-text="'mdi-account-check-outline'"
          />
        </template>
        <span v-text="'Pre-registered WES endpoint'" />
      </v-tooltip>
      <v-spacer />
      <v-chip
        class="mr-4"
        :color="$store.getters['services/stateColor'](service.id)"
        text-color="white"
        v-text="service.state"
      />
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            :color="$colors.grey.darken2"
            outlined
            small
            v-on="on"
            @click.stop="reloadService"
          >
            <v-icon v-text="'mdi-reload'" />
          </v-btn>
        </template>
        <span v-text="'Reload WES endpoint'" />
      </v-tooltip>
    </div>

    <v-data-table
      calculate-widths
      class="mx-12 mt-2 info-table"
      disable-filtering
      disable-pagination
      disable-sort
      :headers="serviceInfoHeaders"
      hide-default-footer
      hide-default-header
      item-key="key"
      :items="serviceInfoContents"
    >
      <template #[`item.value`]="{ item }">
        <span v-text="item.value" />
      </template>
    </v-data-table>
    <div class="mx-12">
      <v-tabs v-model="tab" height="282" vertical>
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
            class="ml-6 mr-1 mt-2 mb-6 elevation-2 content-viewer"
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
          />
        </v-tab-item>
      </v-tabs>
    </div>

    <error-snackbar
      :message="errorSnackbarMessage"
      :show="errorSnackbarShow"
      @close="errorSnackbarShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import { codemirror } from 'vue-codemirror'
import { DataTableHeader } from 'vuetify/types'
import { defineComponent } from 'vue'
import { Service } from '@/store/services'
import { codeMirrorMode, validUrl } from '@/utils'
import ErrorSnackbar from '@/components/ErrorSnackbar.vue'

export default defineComponent({
  components: {
    codemirror,
    ErrorSnackbar,
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
      ] as DataTableHeader[],
      tab: 1 as number | null,
      errorSnackbarShow: false,
      errorSnackbarMessage: '',
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.serviceId)
    },

    serviceInfoContents(): { key: string; value: string }[] {
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

    tabItems(): { key: string; value: string }[] {
      return [
        {
          key: 'Workflow Type Versions',
          value: JSON.stringify(
            this.service.serviceInfo?.workflow_type_versions || '',
            null,
            2
          ),
        },
        {
          key: 'Workflow Engine Versions',
          value: JSON.stringify(
            this.service.serviceInfo?.workflow_engine_versions || '',
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
      await this.$store
        .dispatch('services/updateService', this.serviceId)
        .catch((e) => {
          this.errorSnackbarShow = true
          this.errorSnackbarMessage = `Failed to reload service: ${e}`
          setTimeout(() => {
            this.errorSnackbarShow = false
          }, 5000)
        })
    },

    codeMirrorMode(content: string): ReturnType<typeof codeMirrorMode> {
      return codeMirrorMode(content)
    },

    validUrl(val: string): ReturnType<typeof validUrl> {
      return validUrl(val)
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
