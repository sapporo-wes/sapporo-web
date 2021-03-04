<template>
  <v-card elevation="8" max-width="1200">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="'Runs'" />
      <v-spacer />
      <v-btn
        :color="$colors.grey.darken2"
        :disabled="!runs.length"
        outlined
        small
        @click.stop="reloadRunState"
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </div>
    <div v-if="!runs.length" class="my-2">
      <p
        :style="{ fontSize: '1rem', paddingLeft: '60px' }"
        v-text="'The executed run does not exist.'"
      />
    </div>

    <v-data-table
      v-if="runs.length"
      v-model="selectedRuns"
      :headers="runHeaders"
      :items-per-page="Number(10)"
      :items="runs"
      calculate-widths
      class="mx-6 my-2"
      item-key="id"
      multi-sort
      show-select
    >
      <template #[`item.name`]="{ item }">
        <nuxt-link
          :to="{ path: '/runs', query: { runId: item.id } }"
          v-text="item.name"
        />
      </template>
      <template #[`item.service`]="{ item }">
        <nuxt-link
          :to="{ path: '/services', query: { serviceId: item.serviceId } }"
          v-text="$store.getters['services/service'](item.serviceId).name || ''"
        />
      </template>
      <template #[`item.workflow`]="{ item }">
        <nuxt-link
          :to="{ path: '/workflows', query: { workflowId: item.workflowId } }"
          v-text="
            $store.getters['workflows/workflow'](item.workflowId).name || ''
          "
        />
      </template>
      <template #[`item.workflowTypeVersion`]="{ item }">
        {{
          `${
            $store.getters['workflows/workflow'](item.workflowId).type || ''
          } ${
            $store.getters['workflows/workflow'](item.workflowId).version || ''
          }`
        }}
      </template>
      <template #[`item.addedDate`]="{ item }">
        {{ $dayjs(item.addedDate).local().format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template #[`item.state`]="{ item }">
        <v-chip
          :color="$store.getters['runs/stateColor'](item.id)"
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
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
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
import { Run } from '@/store/runs'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import RunDeleteDialog from '@/components/index/RunDeleteDialog.vue'
import Vue from 'vue'

type Data = {
  runHeaders: DataTableHeader[]
  selectedRuns: Run[]
  deleteDialogShow: boolean
}

type Methods = {
  reloadRunState: () => Promise<void>
}

type Computed = {
  runs: Run[]
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
          value: 'name',
        },
        {
          text: 'Service',
          value: 'service',
        },
        {
          text: 'Workflow',
          value: 'workflow',
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
    runs(): Run[] {
      return this.$store.getters['runs/runs']
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
