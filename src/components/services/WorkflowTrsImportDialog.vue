<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="1200"
    @click:outside="$emit('close')"
  >
    <v-card class="pb-4">
      <div class="d-flex align-center mx-6 pt-4">
        <v-icon color="black" left v-text="'mdi-application-import'" />
        <div class="card-header" v-text="'Import Workflow from TRS'" />
      </div>
      <div class="mx-12 my-2">
        <v-text-field
          v-model="trsEndpoint"
          :persistent-hint="!trsEndpoint.length"
          :rules="trsEndpointRules"
          hint="Endpoint of the TRS (e.g., 'https://workflowhub.eu/ga4gh/trs/v2' etc.)"
          label="TRS Endpoint"
          placeholder="Type a TRS endpoint"
          @input="changeTrsEndpoint"
        />
      </div>
      <div v-if="tableContents.length" class="d-flex mx-12">
        <v-spacer />
        <v-select
          v-model="filterType"
          :items="wfTypes"
          :prepend-inner-icon="'mdi-filter-outline'"
          :style="{ maxWidth: '160px', minWidth: '160px' }"
          class="mr-6"
          clearable
          dense
          hide-details
          label="Type"
          single-line
        />
        <v-text-field
          v-model="filterWorklfowName"
          :prepend-inner-icon="'mdi-magnify'"
          :style="{ maxWidth: '200px', minWidth: '200px' }"
          class="mr-6"
          clearable
          dense
          hide-details
          label="Name"
          single-line
        />
        <v-text-field
          v-model="filterOrganization"
          :prepend-inner-icon="'mdi-magnify'"
          :style="{ maxWidth: '200px', minWidth: '200px' }"
          clearable
          dense
          hide-details
          label="Organization"
          single-line
        />
      </div>
      <v-data-table
        v-if="tableContents.length"
        :headers="tableHeaders"
        :items-per-page="Number(10)"
        :items="tableContents"
        class="mx-12 my-2 workflow-table"
        item-key="idVersionType"
      >
        <template #[`item.workflowType`]="{ item }">
          <img
            v-if="item.workflowType === 'CWL'"
            src="~/assets/icon/cwl-icon.png"
            class="mt-2 mr-2"
            height="26"
          />
          <img
            v-else-if="item.workflowType === 'WDL'"
            src="~/assets/icon/wdl-icon.png"
            class="mt-2 mr-2"
            height="26"
          />
          <img
            v-else-if="item.workflowType === 'Nextflow'"
            src="~/assets/icon/nextflow-icon.png"
            class="mt-2 mr-2"
            height="26"
          />
          <img
            v-else-if="item.workflowType === 'Snakemake'"
            src="~/assets/icon/snakemake-icon.png"
            class="mt-2 mr-2"
            height="26"
          />
          <v-icon v-else class="my-2 mr-2" v-text="'mdi-graph-outline'" />
        </template>
        <template #[`item.workflowNameVal`]="{ item }">
          <span>
            {{ item.workflowName }}
            <v-chip
              :color="$colors.indigo.lighten2"
              text-color="white"
              small
              class="ml-4"
              v-text="`ver. ${item.workflowVersion}`"
            />
          </span>
        </template>
        <template #[`item.workflowUrl`]="{ item }">
          <a :href="item.workflowUrl" v-text="item.workflowUrl" />
        </template>
        <template #[`item.importButton`]="{ item }">
          <v-btn
            class="text-capitalize"
            color="primary"
            outlined
            small
            @click.stop="importWorkflow(item)"
            v-text="'Import'"
          />
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import {
  getServiceInfo,
  ServiceInfoResponse,
  getTools,
  ToolsResponse,
  workflowTypes,
  WorkflowType,
  descriptorTypeToWorkflowType,
} from '@/utils/TRSRequest'
import { validUrl } from '@/utils'
import { Service, WorkflowLanguage } from '@/store/services'

const changeQueue: Array<NodeJS.Timeout> = []

interface TableContent {
  id: string
  version: string
  idVersionType: string
  workflowType: WorkflowType
  workflowName: string
  workflowNameVal: string
  workflowVersion: string
  organization: string
  workflowUrl: string
  importButton: string
}

type Data = {
  trsEndpoint: string
  fetchFailed: boolean
  serviceInfo: ServiceInfoResponse | null
  tools: ToolsResponse
  tableHeaders: DataTableHeader[]
  filterType: WorkflowType | null
  filterWorklfowName: string
  filterOrganization: string
}

type Methods = {
  changeTrsEndpoint: (event: Event) => void
  fetchTrs: (trsEndpoint: string) => void
  importWorkflow: (item: TableContent) => void
}

type Computed = {
  service: Service
  wfLangs: WorkflowLanguage[]
  wfTypes: string[]
  trsEndpointRules: string[]
  tableContents: TableContent[]
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
    AppBar,
    AppFooter,
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
      trsEndpoint: 'https://workflowhub.eu/ga4gh/trs/v2',
      fetchFailed: false,
      serviceInfo: null,
      tools: [],
      tableHeaders: [
        {
          text: '',
          value: 'workflowType',
          sortable: false,
          width: '40px',
        },
        {
          text: 'Name',
          value: 'workflowNameVal',
          sortable: true,
        },
        {
          text: 'Organization',
          value: 'organization',
          sortable: true,
        },
        {
          text: 'Workflow URL',
          value: 'workflowUrl',
          sortable: false,
        },
        {
          text: '',
          value: 'importButton',
          sortable: false,
        },
      ],
      filterType: null,
      filterWorklfowName: '',
      filterOrganization: '',
    }
  },

  computed: {
    service() {
      return this.$store.getters['services/service'](this.serviceId)
    },

    wfLangs() {
      return this.$store.getters['services/workflowLanguages'](this.serviceId)
    },

    wfTypes() {
      return this.wfLangs.map((lang) => lang.name)
    },

    trsEndpointRules() {
      if (!this.trsEndpoint) {
        return ['Required']
      }
      if (!validUrl(this.trsEndpoint)) {
        return ['Invalid URL']
      }
      if (this.fetchFailed) {
        return ['Failed to fetch TRS response from the endpoint']
      }
      if (this.serviceInfo) {
        if (this.serviceInfo.type.artifact !== 'trs') {
          return ['Not a TRS endpoint']
        }
        if (!this.serviceInfo.type.version.startsWith('2')) {
          return ['Not a TRS v2 endpoint']
        }
      }
      return []
    },

    tableContents() {
      const tableContents: TableContent[] = []
      for (const tool of this.tools) {
        for (const version of tool.versions) {
          if (version.descriptor_type) {
            for (const type of version.descriptor_type) {
              const tableContent = {
                id: tool.id,
                version: version.id,
                idVersionType: `${tool.id}-${version.id}-${type}`,
                workflowType: descriptorTypeToWorkflowType(type),
                workflowName: tool.name ? `${tool.name}` : `${tool.id}-${type}`,
                workflowNameVal: tool.name
                  ? `${tool.name}-${version.id}`
                  : `${tool.id}-${type}-${version.id}`,
                workflowVersion: version.id,
                organization: tool.organization,
                workflowUrl: version.url,
                importButton: '',
              }
              if (
                this.filterType &&
                tableContent.workflowType !== this.filterType
              ) {
                continue
              }
              if (
                !tableContent.workflowName.includes(this.filterWorklfowName)
              ) {
                continue
              }
              if (
                !tableContent.organization.includes(this.filterOrganization)
              ) {
                continue
              }
              tableContents.push(tableContent)
            }
          }
        }
      }
      return tableContents
    },
  },

  methods: {
    changeTrsEndpoint(_: Event) {
      while (changeQueue.length) {
        const timeoutId = changeQueue.shift()
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
      const eventId = setTimeout(
        (trsEndpoint) => {
          this.fetchTrs(trsEndpoint)
        },
        500,
        this.trsEndpoint
      )
      changeQueue.push(eventId)
    },

    fetchTrs(trsEndpoint: string) {
      if (validUrl(trsEndpoint)) {
        this.trsEndpoint = trsEndpoint.replace(/\/$/, '')
        getServiceInfo(this.trsEndpoint)
          .then((response) => {
            this.fetchFailed = false
            this.serviceInfo = response
            if (
              this.serviceInfo.type.artifact === 'trs' &&
              this.serviceInfo.type.version.startsWith('2')
            ) {
              for (const wfType of this.wfTypes) {
                if (workflowTypes.includes(wfType)) {
                  getTools(this.trsEndpoint, wfType).then((response) => {
                    this.tools = this.tools.concat(response)
                  })
                }
              }
            }
          })
          .catch(() => {
            this.fetchFailed = true
            this.serviceInfo = null
            this.tools = []
          })
      }
    },

    importWorkflow(workflow: TableContent) {
      const wfLang = this.wfLangs.find(
        (lang) => lang.name === workflow.workflowType
      )
      this.$store
        .dispatch('workflows/importWorkflowFromTrs', {
          serviceId: this.serviceId,
          trsEndpoint: this.trsEndpoint,
          trsWorkflowId: workflow.id,
          trsWorkflowVersion: workflow.version,
          trsWorkflowType: workflow.workflowType,
          trsWorkflowName: workflow.workflowNameVal,
          workflowVersion: wfLang?.versions[0] || '',
        })
        .then((workflowId) => {
          this.$emit('close')
          this.$router.push({ path: '/workflows', query: { workflowId } })
        })
    },
  },

  mounted() {
    this.fetchTrs(this.trsEndpoint)
  },
}

export default Vue.extend(options)
</script>
