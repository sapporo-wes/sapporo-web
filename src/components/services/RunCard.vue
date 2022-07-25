<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-chart-box-outline'" />
      <div class="card-header" v-text="'Runs'" />
      <v-spacer />
      <v-select
        v-if="runsTableItems.length"
        v-model="filterType"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        :items="workflowTypes"
        label="Type"
        :prepend-inner-icon="'mdi-filter-outline'"
        single-line
        :style="{ maxWidth: '160px', minWidth: '160px' }"
      />
      <v-text-field
        v-if="runsTableItems.length"
        v-model="filterRunName"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        label="Run Name"
        :prepend-inner-icon="'mdi-magnify'"
        single-line
        :style="{ maxWidth: '200px', minWidth: '200px' }"
      />
      <v-text-field
        v-if="runsTableItems.length"
        v-model="filterWfName"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        label="Workflow Name"
        :prepend-inner-icon="'mdi-magnify'"
        single-line
        :style="{ maxWidth: '200px', minWidth: '200px' }"
      />
      <v-tooltip top>
        <template #activator="{ on }">
          <v-btn
            :color="$colors.grey.darken2"
            :disabled="!runsTableItems.length"
            outlined
            small
            v-on="on"
            @click.stop="reloadRunState"
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
      class="mx-12 my-2 run-table"
      :headers="runHeaders"
      item-key="runId"
      :items="filteredItems"
      :items-per-page="Number(10)"
    >
      <template #[`item.workflowType`]="{ item }">
        <workflow-icon :wf-type="item.workflowType" />
      </template>
      <template #[`item.runName`]="{ item }">
        <nuxt-link
          :style="{ textDecoration: 'none' }"
          :to="{ path: '/runs', query: { runId: item.runId } }"
          v-text="item.runName"
        />
      </template>
      <template #[`item.workflowName`]="{ item }">
        <nuxt-link
          :style="{ textDecoration: 'none' }"
          :to="{ path: '/workflows', query: { workflowId: item.workflowId } }"
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
import { defineComponent } from 'vue'
import { RunTableItem } from '@/store/runs'
import { Service } from '@/store/services'
import RunDeleteDialog from '@/components/services/RunDeleteDialog.vue'
import RunImportDialog from '@/components/services/RunImportDialog.vue'
import WorkflowIcon from '@/components/WorkflowIcon.vue'

export default defineComponent({
  components: {
    RunDeleteDialog,
    RunImportDialog,
    WorkflowIcon,
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
      ] as DataTableHeader[],
      selectedRuns: [] as RunTableItem[],
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

    runsTableItems(): RunTableItem[] {
      return this.$store.getters['runs/tableItems'](this.service.runIds)
    },

    filteredItems(): RunTableItem[] {
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

    workflowTypes(): string[] {
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
})
</script>

<style scoped>
.run-table >>> td:first-child {
  padding-right: 0px;
}
</style>
