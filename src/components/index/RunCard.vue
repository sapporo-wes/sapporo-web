<template>
  <v-card elevation="8" max-width="1200">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="'Runs'" />
      <v-spacer />
      <v-btn
        :color="$colors.grey.darken2"
        :disabled="!runsTableItems.length"
        outlined
        small
        @click.stop="reloadRunState"
      >
        <v-icon v-text="'mdi-reload'" />
      </v-btn>
    </div>
    <div v-if="!runsTableItems.length" class="my-2">
      <div class="mx-12">
        <span
          :style="{ fontSize: '1rem' }"
          v-text="'The executed run does not exist.'"
        />
      </div>
    </div>

    <v-data-table
      v-if="runsTableItems.length"
      v-model="selectedRuns"
      :headers="runHeaders"
      :items-per-page="Number(10)"
      :items="runsTableItems"
      calculate-widths
      class="mx-6 my-2"
      item-key="runId"
      multi-sort
      show-select
    >
      <template #[`item.runName`]="{ item }">
        <nuxt-link
          :to="{ path: '/runs', query: { runId: item.runId } }"
          v-text="item.runName"
        />
      </template>
      <template #[`item.serviceName`]="{ item }">
        <nuxt-link
          :to="{ path: '/services', query: { serviceId: item.serviceId } }"
          v-text="item.serviceName"
        />
      </template>
      <template #[`item.workflowName`]="{ item }">
        <nuxt-link
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
    </v-data-table>

    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        color="error"
        :disabled="!selectedRuns.length"
        outlined
        width="140"
        @click.stop="deleteDialogShow = true"
      >
        <v-icon class="mr-2" v-text="'mdi-trash-can-outline'" />
        <span v-text="'Delete'" />
      </v-btn>
    </div>

    <run-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedRuns"
      @clear-selected="selectedRuns = []"
      @close="deleteDialogShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { Run, RunTableItem } from '@/store/runs'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import RunDeleteDialog from '@/components/index/RunDeleteDialog.vue'
import Vue from 'vue'

type Data = {
  runHeaders: DataTableHeader[]
  selectedRuns: RunTableItem[]
  deleteDialogShow: boolean
}

type Methods = {
  reloadRunState: () => Promise<void>
}

type Computed = {
  runsTableItems: RunTableItem[]
}

type Props = Record<string, unknown>

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  components: {
    RunDeleteDialog,
  },

  data() {
    return {
      runHeaders: [
        {
          text: 'Name',
          value: 'runName',
        },
        {
          text: 'Service',
          value: 'serviceName',
        },
        {
          text: 'Workflow',
          value: 'workflowName',
        },
        {
          text: 'Type Version',
          value: 'workflowTypeVersion',
        },
        {
          text: 'Added Date',
          value: 'addedDate',
        },
        {
          text: 'State',
          value: 'state',
        },
      ],
      selectedRuns: [],
      deleteDialogShow: false,
    }
  },

  computed: {
    runsTableItems() {
      const runs: Run[] = this.$store.getters['runs/runs']
      return this.$store.getters['runs/tableItems'](runs.map((run) => run.id))
    },
  },

  methods: {
    async reloadRunState(): Promise<void> {
      await this.$store.dispatch('runs/updateAllRunsState')
    },
  },
}

export default Vue.extend(options)
</script>
