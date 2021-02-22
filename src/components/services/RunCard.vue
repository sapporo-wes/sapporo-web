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
        v-text="'No executed runs exist.'"
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
          v-text="$store.getters['services/service'](item.serviceId).name"
        />
      </template>
      <template #[`item.workflow`]="{ item }">
        <nuxt-link
          :to="{ path: '/workflows', query: { workflowId: item.workflowId } }"
          v-text="$store.getters['workflows/workflow'](item.workflowId).name"
        />
      </template>
      <template #[`item.workflowTypeVersion`]="{ item }">
        {{
          `${$store.getters['workflows/workflow'](item.workflowId).type} ${
            $store.getters['workflows/workflow'](item.workflowId).version
          }`
        }}
      </template>
      <template #[`item.addedDate`]="{ item }">
        {{ item.addedDate | formatDate }}
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
        @click.stop="deleteDialogShow = true"
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>
    <run-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedRuns"
      @close="deleteDialogShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { Run } from '@/store/runs'
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import dayjs from 'dayjs'
import RunDeleteDialog from '@/components/services/RunDeleteDialog.vue'
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
  service: Service
  runs: Run[]
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
          text: 'Name',
          value: 'name',
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
    service(): Service {
      return this.$store.getters['services/service'](this.serviceId)
    },

    runs(): Run[] {
      return this.$store.getters['runs/runsByIds'](this.service.runIds)
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

  filters: {
    formatDate(date: Date): string {
      return dayjs(date).format('YYYY-MM-DD hh:mm:ss')
    },
  },
}

export default Vue.extend(options)
</script>
