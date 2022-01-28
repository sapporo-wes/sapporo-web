<template>
  <v-dialog
    :value="dialogShow"
    eager
    overlay-opacity="0.8"
    width="1200"
    @click:outside="$emit('close')"
  >
    <v-card class="pb-4">
      <div class="d-flex align-center mx-6 pt-4">
        <v-icon color="black" left v-text="'mdi-application-import'" />
        <div class="card-header" v-text="'Import Workflow from TRS'" />
      </div>
      <div class="mx-12 my-2 d-flex align-center">
        <v-form ref="form" class="flex-grow-1 mr-4">
          <v-text-field
            v-model="trsEndpoint"
            :persistent-hint="!trsEndpoint.length"
            :rules="trsEndpointRules"
            hint="Endpoint of the TRS (e.g., 'https://workflowhub.eu/ga4gh/trs/v2' etc.)"
            label="TRS Endpoint"
            placeholder="Type a TRS endpoint"
            @input="changeTrsEndpoint"
          />
        </v-form>
        <v-btn
          v-for="(item, index) in defaultEndpoints"
          :key="item.name"
          :class="{
            'text-capitalize': true,
            'mr-2': index != defaultEndpoints.length - 1,
          }"
          outlined
          width="110"
          small
          @click.stop="
            trsEndpoint = item.endpoint
            fetchTrs(item.endpoint)
          "
          v-text="item.name"
        />
      </div>
      <div class="d-flex mx-12">
        <v-spacer />
        <v-select
          v-model="filterType"
          :disabled="!tableContents.length"
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
          v-model="filterWorkflowName"
          :disabled="!tableContents.length"
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
          :disabled="!tableContents.length"
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
        :headers="tableHeaders"
        :items-per-page="Number(10)"
        :items="filteredTableContents"
        class="mx-12 my-2 workflow-table"
        item-key="idVersionType"
      >
        <template #[`item.workflowType`]="{ item }">
          <workflow-icon :wf-type="item.workflowType" />
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'
import AppFooter from '@/components/AppFooter.vue'
import {
  getServiceInfo,
  ServiceInfoResponse,
  getTools,
  ToolsResponse,
  WorkflowType,
  descriptorTypeToWorkflowType,
} from '@/utils/TRSRequest'
import { validUrl } from '@/utils'
import { Service, WorkflowLanguage } from '@/store/services'
import AppBar from '@/components/AppBar.vue'
import WorkflowIcon from '@/components/WorkflowIcon.vue'

const changeQueue: NodeJS.Timeout[] = []

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

interface DefaultEndpoint {
  name: string
  endpoint: string
}

const defaultEndpoints: DefaultEndpoint[] = [
  {
    name: 'WorkflowHub',
    endpoint: 'https://workflowhub.eu/ga4gh/trs/v2',
  },
  {
    name: 'Dockstore',
    endpoint: 'https://dockstore.org/api/ga4gh/trs/v2',
  },
  {
    name: 'BioContainers',
    endpoint: 'https://api.biocontainers.pro/ga4gh/trs/v2',
  },
]

type Data = {
  trsEndpoint: string
  defaultEndpoints: DefaultEndpoint[]
  fetchFailed: boolean
  serviceInfo: ServiceInfoResponse | null
  filterType: WorkflowType | null
  filterWorkflowName: string
  filterOrganization: string
  tableContents: TableContent[]
}

type Methods = {
  changeTrsEndpoint: (event: Event) => void
  fetchTrs: (trsEndpoint: string) => void
  importWorkflow: (item: TableContent) => void
  updateTableContents: () => void
}

type Computed = {
  service: Service
  wfLangs: WorkflowLanguage[]
  wfTypes: string[]
  trsEndpointRules: string[]
  tableHeaders: DataTableHeader[]
  filteredTableContents: TableContent[]
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
    WorkflowIcon,
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
      trsEndpoint: defaultEndpoints.filter(
        (item) => item.name === 'WorkflowHub'
      )[0].endpoint,
      defaultEndpoints,
      fetchFailed: false,
      serviceInfo: null,
      filterType: null,
      filterWorkflowName: '',
      filterOrganization: '',
      tableContents: [],
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
        if (this.serviceInfo.type.artifact.toLowerCase() !== 'trs') {
          return ['Not a TRS endpoint']
        }
        if (!this.serviceInfo.type.version.startsWith('2')) {
          return ['Not a TRS v2 endpoint']
        }
      }
      return []
    },

    tableHeaders() {
      const tableHeaders = [
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
          text: '',
          value: 'importButton',
          sortable: false,
        },
      ]
      if (this.trsEndpoint !== 'https://dockstore.org/api/ga4gh/trs/v2') {
        tableHeaders.splice(3, 0, {
          text: 'Workflow URL',
          value: 'workflowUrl',
          sortable: false,
        })
      }
      return tableHeaders
    },

    filteredTableContents() {
      return this.tableContents.filter((item) => {
        if (this.filterType && item.workflowType !== this.filterType) {
          return false
        }
        if (
          this.filterWorkflowName &&
          !item.workflowName.toLowerCase().includes(this.filterWorkflowName)
        ) {
          return false
        }
        if (
          this.filterOrganization &&
          !item.organization.toLowerCase().includes(this.filterOrganization)
        ) {
          return false
        }
        return true
      })
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
            this.updateTableContents()
          })
          .catch(() => {
            this.fetchFailed = true
            this.serviceInfo = null
          })
      }
    },

    importWorkflow(workflow: TableContent) {
      const wfVersion =
        this.wfLangs.find((lang) => lang.name === workflow.workflowType)
          ?.versions[0] || ''
      this.$store
        .dispatch('workflows/importWorkflowFromTrs', {
          serviceId: this.serviceId,
          trsEndpoint: this.trsEndpoint,
          trsWorkflowId: workflow.id,
          trsWorkflowVersion: workflow.version,
          trsWorkflowType: workflow.workflowType,
          trsWorkflowName: `${workflow.workflowName}: ${workflow.workflowVersion}`,
          workflowVersion: wfVersion,
        })
        .then((workflowId) => {
          this.$emit('close')
          this.$router.push({ path: '/workflows', query: { workflowId } })
        })
    },

    updateTableContents() {
      this.tableContents = []
      if (
        this.serviceInfo &&
        this.serviceInfo.type.artifact.toLowerCase() === 'trs' &&
        this.serviceInfo.type.version.startsWith('2')
      ) {
        for (const wfType of this.wfTypes) {
          getTools(this.trsEndpoint, wfType)
            .then((res: ToolsResponse) => {
              for (const tool of res) {
                for (const version of tool.versions) {
                  if (version.descriptor_type) {
                    for (const type of version.descriptor_type) {
                      const tableContent: TableContent = {
                        id: tool.id,
                        version: version.id,
                        idVersionType: `${tool.id}-${version.id}-${type}`,
                        workflowType: descriptorTypeToWorkflowType(type),
                        workflowName: tool.name
                          ? `${tool.name}`
                          : `${tool.id}-${type}`,
                        workflowNameVal: tool.name
                          ? `${tool.name}-${version.id}`
                          : `${tool.id}-${type}-${version.id}`,
                        workflowVersion: version.id,
                        organization: tool.organization,
                        workflowUrl: version.url,
                        importButton: '',
                      }
                      this.tableContents.push(tableContent)
                    }
                  }
                }
              }
            })
            .catch((_) => {
              // do nothing
            })
        }
      }
    },
  },

  mounted() {
    this.fetchTrs(this.trsEndpoint)
  },
}

export default Vue.extend(options)
</script>
