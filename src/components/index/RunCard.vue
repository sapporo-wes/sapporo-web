<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header pl-6 pt-4">
      Runs
    </div>
    <div v-if="!this.runs.length" class="my-2">
      <p class="info--text" style="font-size: 16px; padding-left: 60px;">
        No executed runs exist.
      </p>
    </div>
    <v-data-table
      :headers="runHeaders"
      :items-per-page="runTableItemPerNum"
      :items="runs"
      calculate-widths
      class="info--text mx-6 my-2"
      item-key="namePlusService"
      show-select
      v-if="this.runs.length"
      v-model="selectedRuns"
    >
      <template v-slot:item.state="{ item }">
        <v-chip :color="getRunStateColor(item.state)" text-color="white">
          {{ item.state }}
        </v-chip>
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        :color="this.$colors.red.darken4"
        :disabled="!this.selectedRuns.length"
        outlined
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'
import { RunState } from '@/utils/types'

type Run = {
  name: string
  service: string
  namePlusService: string
  date: string
  state: string
}

type DataObj = {
  runTableItemPerNum: number
  runHeaders: DataTableHeader[]
  runs: Run[]
  selectedRuns: Run[]
}

export default Vue.extend({
  data(): DataObj {
    return {
      runTableItemPerNum: 10,
      runHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Service',
          value: 'service'
        },
        {
          text: 'Date',
          value: 'date'
        },
        {
          text: 'State',
          value: 'state'
        }
      ],
      runs: [
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'A',
          date: '2020/01/01 00:00:00',
          state: 'UNKNOWN'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'B',
          date: '2020/01/01 00:00:00',
          state: 'QUEUED'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'C',
          date: '2020/01/01 00:00:00',
          state: 'INITIALIZING'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'D',
          date: '2020/01/01 00:00:00',
          state: 'RUNNING'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'E',
          date: '2020/01/01 00:00:00',
          state: 'PAUSED'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'F',
          date: '2020/01/01 00:00:00',
          state: 'COMPLETE'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'G',
          date: '2020/01/01 00:00:00',
          state: 'EXECUTOR_ERROR'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'H',
          date: '2020/01/01 00:00:00',
          state: 'SYSTEM_ERROR'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'I',
          date: '2020/01/01 00:00:00',
          state: 'CANCELED'
        },
        {
          name: 'Test Run1',
          service: 'TestService1',
          namePlusService: 'J',
          date: '2020/01/01 00:00:00',
          state: 'CANCELING'
        }
      ],
      selectedRuns: []
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
    }
  }
})
</script>
