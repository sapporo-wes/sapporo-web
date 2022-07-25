<template>
  <v-dialog
    eager
    overlay-opacity="0.8"
    :value="dialogShow"
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
            hint="Endpoint of the TRS (e.g., 'https://workflowhub.eu/ga4gh/trs/v2' etc.)"
            label="TRS Endpoint"
            :persistent-hint="!trsEndpoint.length"
            placeholder="Type a TRS endpoint"
            :rules="trsEndpointRules"
            @input="changeTrsEndpoint"
          />
        </v-form>
        <v-btn
          v-for="(item, index) in defaultEndpoints"
          :key="item.name"
          :class="{
            'text-capitalize': true,
            'mr-2': index !== defaultEndpoints.length - 1,
          }"
          outlined
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
          class="mr-6"
          clearable
          dense
          :disabled="!tableContents.length"
          hide-details
          :items="wfTypes"
          label="Type"
          :prepend-inner-icon="'mdi-filter-outline'"
          single-line
          :style="{ maxWidth: '160px', minWidth: '160px' }"
        />
        <v-text-field
          v-model="filterWorkflowName"
          class="mr-6"
          clearable
          dense
          :disabled="!tableContents.length"
          hide-details
          label="Name"
          :prepend-inner-icon="'mdi-magnify'"
          single-line
          :style="{ maxWidth: '200px', minWidth: '200px' }"
        />
        <v-text-field
          v-model="filterOrganization"
          clearable
          dense
          :disabled="!tableContents.length"
          hide-details
          label="Organization"
          :prepend-inner-icon="'mdi-magnify'"
          single-line
          :style="{ maxWidth: '200px', minWidth: '200px' }"
        />
      </div>
      <v-data-table
        class="mx-12 my-2 workflow-table"
        :headers="tableHeaders"
        item-key="idVersionType"
        :items="filteredTableContents"
        :items-per-page="Number(10)"
        :loading="loading"
      >
        <template #[`item.workflowType`]="{ item }">
          <workflow-icon :wf-type="item.workflowType" />
        </template>
        <template #[`item.workflowNameVal`]="{ item }">
          <span>
            {{ item.workflowName }}
            <v-chip
              class="ml-4"
              :color="$colors.indigo.lighten2"
              small
              text-color="white"
              v-text="`${item.workflowVersion}`"
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
import { DataTableHeader } from 'vuetify/types'
import { defineComponent } from 'vue'
import {
  getServiceInfo,
  ServiceInfoResponse,
  getToolsAll,
  getTools,
  ToolsResponse,
  WorkflowType,
  descriptorTypeToWorkflowType,
} from '@/utils/TRSRequest'
import { validUrl } from '@/utils'
import { Service, WorkflowLanguage } from '@/store/services'
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
    name: 'DDBJ Workflow Registry',
    endpoint: 'https://ddbj.github.io/workflow-registry',
  },
  {
    name: 'WorkflowHub',
    endpoint: 'https://workflowhub.eu/ga4gh/trs/v2',
  },
  {
    name: 'Dockstore',
    endpoint: 'https://dockstore.org/api/ga4gh/trs/v2',
  },
]

export default defineComponent({
  components: {
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
      serviceInfo: null as ServiceInfoResponse | null,
      filterType: null as WorkflowType | null,
      filterWorkflowName: '',
      filterOrganization: '',
      tableContents: [] as TableContent[],
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.serviceId)
    },

    wfLangs(): WorkflowLanguage[] {
      return this.$store.getters['services/workflowLanguages'](this.serviceId)
    },

    wfTypes(): string[] {
      return this.wfLangs.map((lang) => lang.name)
    },

    trsEndpointRules(): string[] {
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
        if (
          !['trs', 'yevis'].includes(
            this.serviceInfo.type.artifact.toLowerCase()
          )
        ) {
          return ['Not a TRS endpoint']
        }
        if (!this.serviceInfo.type.version.startsWith('2')) {
          return ['Not a TRS v2 endpoint']
        }
      }
      return []
    },

    tableHeaders(): DataTableHeader[] {
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
      if (
        !(
          this.trsEndpoint === 'https://dockstore.org/api/ga4gh/trs/v2' ||
          this.serviceInfo?.type.artifact.toLowerCase() === 'yevis'
        )
      ) {
        tableHeaders.splice(3, 0, {
          text: 'Workflow URL',
          value: 'workflowUrl',
          sortable: false,
        })
      }
      return tableHeaders
    },

    filteredTableContents(): TableContent[] {
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

    loading(): boolean {
      if (
        this.trsEndpoint &&
        this.tableContents.length === 0 &&
        !this.fetchFailed
      ) {
        return true
      }
      return false
    },
  },

  mounted() {
    this.fetchTrs(this.trsEndpoint)
  },

  methods: {
    changeTrsEndpoint(_: Event): void {
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

    fetchTrs(trsEndpoint: string): void {
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

    importWorkflow(workflow: TableContent): void {
      this.$store
        .dispatch('workflows/importWorkflowFromTrs', {
          serviceId: this.serviceId,
          trsEndpoint: this.trsEndpoint,
          trsWorkflowId: workflow.id,
          trsWorkflowVersion: workflow.version,
          trsWorkflowType: workflow.workflowType,
          trsWorkflowName: `${workflow.workflowName}: ${workflow.workflowVersion}`,
        })
        .then((workflowId) => {
          this.$emit('close')
          this.$router.push({ path: '/workflows', query: { workflowId } })
        })
    },

    updateTableContents(): void {
      this.tableContents = []
      if (
        this.serviceInfo &&
        ['trs', 'yevis'].includes(
          this.serviceInfo.type.artifact.toLowerCase()
        ) &&
        this.serviceInfo.type.version.startsWith('2')
      ) {
        if (this.serviceInfo.type.artifact.toLowerCase() === 'trs') {
          // for dockstore, workflowhub
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
        } else {
          // for yevis workflow registry
          getToolsAll(this.trsEndpoint)
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
})
</script>
