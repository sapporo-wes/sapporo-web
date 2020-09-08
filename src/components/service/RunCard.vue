<template>
  <v-card elevation="8" max-width="960">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="'Runs'" />
      <v-spacer />
      <v-btn
        :color="$colors.grey.darken2"
        :disabled="!this.runs.length"
        @click="reloadRunState"
        outlined
        small
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </div>
    <div v-if="!this.runs.length" class="my-2">
      <p
        :style="{ fontSize: '1rem', paddingLeft: '60px' }"
        class="info--text"
        v-text="'No executed runs exist.'"
      />
    </div>
    <v-data-table
      :headers="runHeaders"
      :items-per-page="Number(10)"
      :items="runs"
      calculate-widths
      class="mx-6 my-2"
      item-key="id"
      show-select
      v-else
      v-model="selectedRuns"
    >
      <template v-slot:[`item.name`]="{ item }">
        <nuxt-link
          :to="`/run/${item.id}`"
          class="text-decoration-none"
          v-text="item.name"
        />
      </template>
      <template v-slot:[`item.service`]="{ item }">
        <nuxt-link
          :to="`/service/${item.serviceId}`"
          class="text-decoration-none"
          v-text="$store.getters['service/idToName'](item.serviceId)"
        />
      </template>
      <template v-slot:[`item.workflow`]="{ item }">
        <nuxt-link
          :to="`/workflow/${item.workflowId}`"
          class="text-decoration-none"
          v-text="$store.getters['workflow/idToName'](item.workflowId)"
        />
      </template>
      <template v-slot:[`item.addedDate`]="{ item }">
        {{ item.addedDate | formatDate }}
      </template>
      <template v-slot:[`item.state`]="{ item }">
        <v-chip
          :color="getRunStateColor(item.state)"
          text-color="white"
          v-text="item.state"
        />
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        :color="this.$colors.red.darken4"
        :disabled="!this.selectedRuns.length"
        @click.stop="deleteDialogShow = true"
        outlined
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>
    <delete-dialog
      :dialogShow="deleteDialogShow"
      :modelType="'run'"
      :selectedItems="selectedRuns"
      @close="deleteDialogShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'
import DeleteDialog from '@/components/DeleteDialog.vue'
import { Run } from '@/types'
import moment from 'moment'

type DataObj = {
  runHeaders: DataTableHeader[]
  selectedRuns: Run[]
}

export default Vue.extend({
  components: { DeleteDialog },
  props: {
    serviceId: String
  },
  data(): DataObj {
    return {
      runHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Workflow',
          value: 'workflow'
        },
        {
          text: 'Added Date',
          value: 'addedDate'
        },
        {
          text: 'State',
          value: 'state'
        }
      ],
      selectedRuns: [],
      deleteDialogShow: false
    }
  },
  methods: {
    getRunStateColor(runState: string): string {
      if (runState === 'UNKNOWN') return this.$colors.grey.darken1
      else if (runState === 'QUEUED') return this.$colors.lightBlue.darken1
      else if (runState === 'INITIALIZING')
        return this.$colors.lightBlue.darken1
      else if (runState === 'RUNNING') return this.$colors.indigo.darken1
      else if (runState === 'PAUSED') return this.$colors.lightBlue.darken1
      else if (runState === 'COMPLETE') return this.$colors.green.darken1
      else if (runState === 'EXECUTOR_ERROR') return this.$colors.red.darken1
      else if (runState === 'SYSTEM_ERROR') return this.$colors.red.darken1
      else if (runState === 'CANCELED') return this.$colors.amber.darken1
      else if (runState === 'CANCELING') return this.$colors.amber.darken1
      else return this.$colors.grey.darken1
    },
    async reloadRunState(): Promise<void> {
      await this.$store.dispatch(
        'run/updateAllRunsStateByService',
        this.serviceId
      )
    }
  },
  computed: {
    runs(): Run[] {
      return this.$store.getters['run/runsFilteredByServiceId'](this.serviceId)
    }
  },
  filters: {
    formatDate(date: Date): string {
      return moment(date).format('YYYY-MM-DD hh:mm:ss')
    }
  }
})
</script>
