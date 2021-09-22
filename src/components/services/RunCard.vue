<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-chart-box-outline'" />
      <div class="card-header" v-text="'Runs'" />
      <v-spacer />
      <v-select
        v-if="runsTableItems.length"
        v-model="filterType"
        :items="workflowTypes"
        :prepend-inner-icon="'mdi-filter-outline'"
        :style="{ maxWidth: '160px', minWidth: '160px' }"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        label="Type"
        single-line
      />
      <v-text-field
        v-if="runsTableItems.length"
        v-model="filterRunName"
        :prepend-inner-icon="'mdi-magnify'"
        :style="{ maxWidth: '200px', minWidth: '200px' }"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        label="Run Name"
        single-line
      />
      <v-text-field
        v-if="runsTableItems.length"
        v-model="filterWfName"
        :prepend-inner-icon="'mdi-magnify'"
        :style="{ maxWidth: '200px', minWidth: '200px' }"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        label="Workflow Name"
        single-line
      />
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            :color="$colors.grey.darken2"
            :disabled="!runsTableItems.length"
            outlined
            small
            @click.stop="reloadRunState"
            v-on="on"
          >
            <v-icon v-text="'mdi-reload'" />
          </v-btn>
        </template>
        <span v-text="'Reload run status'" />
      </v-tooltip>
    </div>
    <div v-if="!runsTableItems.length" class="mx-12 my-2">
      <span
        :style="{ fontSize: '1rem', color: $colors.grey.darken4 }"
        v-text="'Executed runs will show up here.'"
      />
    </div>

    <v-data-table
      v-if="runsTableItems.length"
      :headers="runHeaders"
      :items-per-page="Number(10)"
      :items="filteredItems"
      class="mx-12 my-2 run-table"
      item-key="runId"
    >
      <template #[`item.workflowType`]="{ item }">
        <v-tooltip top>
          <template #activator="{ on }">
            <img
              v-if="item.workflowType.toLowerCase() === 'cwl'"
              src="~/assets/icon/cwl-icon.png"
              class="mt-2 mr-2"
              height="26"
              v-on="on"
            />
            <img
              v-else-if="item.workflowType.toLowerCase() === 'wdl'"
              src="~/assets/icon/wdl-icon.png"
              class="mt-2 mr-2"
              height="26"
              v-on="on"
            />
            <img
              v-else-if="item.workflowType.toLowerCase() === 'nextflow'"
              src="~/assets/icon/nextflow-icon.png"
              class="mt-2 mr-2"
              height="26"
              v-on="on"
            />
            <img
              v-else-if="item.workflowType.toLowerCase() === 'snakemake'"
              src="~/assets/icon/snakemake-icon.png"
              class="mt-2 mr-2"
              height="26"
              v-on="on"
            />
            <v-icon
              v-else
              class="my-2 mr-2"
              v-on="on"
              v-text="'mdi-graph-outline'"
            />
          </template>
          <span v-text="`${item.workflowType} ${item.workflowVersion}`" />
        </v-tooltip>
      </template>
      <template #[`item.runName`]="{ item }">
        <nuxt-link
          :to="{ path: '/runs', query: { runId: item.runId } }"
          :style="{ textDecoration: 'none' }"
          v-text="item.runName"
        />
      </template>
      <template #[`item.workflowName`]="{ item }">
        <nuxt-link
          :to="{ path: '/workflows', query: { workflowId: item.workflowId } }"
          :style="{ textDecoration: 'none' }"
          v-text="item.workflowName"
        />
      </template>
      <template #[`item.state`]="{ item }">
        <v-chip
          :color="item.stateColor"
          text-color="white"
          v-text="item.state"
        />
      </template>
      <template #[`item.delete`]="{ item }">
        <v-icon
          :color="$colors.grey.darken2"
          @click.stop="
            selectedRuns = [item]
            deleteDialogShow = true
          "
          v-text="'mdi-trash-can-outline'"
        />
      </template>
    </v-data-table>

    <div class="d-flex justify-end pb-6 mr-12 mt-2">
      <v-btn
        color="primary"
        outlined
        width="140"
        @click.stop="importDialogShow = true"
      >
        <v-icon left v-text="'mdi-sticker-plus-outline'" />
        <span v-text="'Import'" />
      </v-btn>
    </div>

    <run-import-dialog
      :dialog-show="importDialogShow"
      :service-id="serviceId"
      @close="importDialogShow = false"
    />

    <run-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedRuns"
      @close="
        deleteDialogShow = false
        selectedRuns = []
      "
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { RunTableItem } from '@/store/runs'
import { Service } from '@/store/services'
import RunDeleteDialog from '@/components/services/RunDeleteDialog.vue'
import RunImportDialog from '@/components/services/RunImportDialog.vue'

type Data = {
  runHeaders: DataTableHeader[]
  selectedRuns: RunTableItem[]
  importDialogShow: boolean
  deleteDialogShow: boolean
  filterType: string
  filterWfName: string
  filterRunName: string
}

type Methods = {
  reloadRunState: () => Promise<void>
}

type Computed = {
  service: Service
  runsTableItems: RunTableItem[]
  filteredItems: RunTableItem[]
  workflowTypes: string[]
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
    RunDeleteDialog,
    RunImportDialog,
  },

  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      runHeaders: [
        {
          text: '',
          value: 'workflowType',
          sortable: false,
          width: '40px',
        },
        {
          text: 'Name',
          value: 'runName',
          sortable: true,
        },
        {
          text: 'Workflow',
          value: 'workflowName',
          sortable: true,
        },
        {
          text: 'Added Date',
          value: 'addedDate',
          sortable: true,
        },
        {
          text: '',
          value: 'state',
          sortable: false,
        },
        {
          text: '',
          value: 'delete',
          sortable: false,
          align: 'center',
          width: '64px',
        },
      ],
      selectedRuns: [],
      importDialogShow: false,
      deleteDialogShow: false,
      filterType: '',
      filterWfName: '',
      filterRunName: '',
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.serviceId)
    },

    runsTableItems() {
      return this.$store.getters['runs/tableItems'](this.service.runIds)
    },

    filteredItems() {
      return this.runsTableItems.filter((item: RunTableItem) => {
        if (this.filterType && item.workflowType !== this.filterType) {
          return false
        }
        if (
          this.filterWfName &&
          !item.workflowName.includes(this.filterWfName)
        ) {
          return false
        }
        if (this.filterRunName && !item.runName.includes(this.filterRunName)) {
          return false
        }
        return true
      })
    },

    workflowTypes() {
      return Array.from(
        new Set(this.runsTableItems.map((item) => item.workflowType))
      )
    },
  },

  methods: {
    async reloadRunState(): Promise<void> {
      await this.$store.dispatch(
        'runs/updateAllRunsStateByService',
        this.service.id
      )
    },
  },
}

export default Vue.extend(options)
</script>

<style scoped>
.run-table >>> td:first-child {
  padding-right: 0px;
}
</style>
