<template>
  <v-card elevation="8" max-width="960" v-if="service">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-text="this.service.name" />
      <v-chip
        :class="[i === 0 ? 'ml-4' : 'ml-2']"
        :color="$colors.indigo.lighten2"
        :key="i"
        label
        small
        text-color="white"
        v-for="(wesVersion, i) in service.supportedWesVersions"
        v-text="`WES ${wesVersion}`"
      />
      <v-spacer></v-spacer>
      <v-chip
        :color="getServiceStateColor(service.state)"
        class="mr-4"
        text-color="white"
        v-text="service.state"
      />
      <v-btn
        :color="$colors.grey.darken2"
        @click="reloadServiceState"
        outlined
        small
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </div>
    <div
      class="pl-12"
      :style="{
        color: $colors.grey.darken4,
        fontSize: '14px',
        fontWeight: '300'
      }"
      v-text="service.endpoint"
    />
    <div class="d-flex px-10 pt-2 justify-space-between pb-6">
      <div
        :style="{ width: '47%' }"
        class="d-flex flex-column"
        v-if="workflowLanguages.length"
      >
        <div :style="{ fontSize: '20px' }" v-text="'Workflow Languages'" />
        <v-data-table
          :headers="workflowLanguageHeaders"
          :items="workflowLanguages"
          class="pl-2"
          dense
          disable-filtering
          disable-pagination
          disable-sort
          hide-default-footer
          item-key="name"
        >
          <template v-slot:item.versions="{ item }">
            {{ item.versions.join(', ') }}
          </template>
        </v-data-table>
      </div>
      <div
        :style="{ width: '47%' }"
        class="d-flex flex-column"
        v-if="workflowEngines.length"
      >
        <div :style="{ fontSize: '20px' }" v-text="'Workflow Engines'" />
        <v-data-table
          :headers="workflowEngineHeaders"
          :items="workflowEngines"
          class="pl-2"
          dense
          disable-filtering
          disable-pagination
          disable-sort
          hide-default-footer
          item-key="name"
        >
        </v-data-table>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { WorkflowTypeVersion, Service, WorkflowEngine } from '@/types'
import Vue from 'vue'

type DataObj = {
  workflowEngineHeaders: DataTableHeader[]
  workflowLanguageHeaders: DataTableHeader[]
}

type WorkflowLanguage = {
  name: string
  versions: string[]
}

export default Vue.extend({
  props: {
    serviceId: String
  },
  data(): DataObj {
    return {
      workflowEngineHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Version',
          value: 'version'
        }
      ],
      workflowLanguageHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Versions',
          value: 'versions'
        }
      ]
    }
  },
  computed: {
    service(): Service {
      return this.$store.getters['service/serviceFilterId'](this.serviceId)
    },
    workflowEngines(): WorkflowEngine[] {
      return this.$store.getters['service/workflowEngines'](this.serviceId)
    },
    workflowLanguages(): WorkflowLanguage[] {
      return Object.entries(this.service.workflowTypeVersions).map(
        ([name, versions]: [
          string,
          WorkflowTypeVersion
        ]): WorkflowLanguage => ({
          name: name,
          versions: versions.workflowTypeVersion
        })
      )
    }
  },
  methods: {
    getServiceStateColor(serviceState: string): string {
      if (serviceState === 'Available') return this.$colors.green.darken1
      else if (serviceState === 'Disconnect') return this.$colors.red.darken1
      else if (serviceState === 'Unknown') return this.$colors.grey.darken1
      return this.$colors.grey.darken1
    },
    reloadServiceState(): void {
      alert('Reload state') // TODO
    }
  }
})
</script>
