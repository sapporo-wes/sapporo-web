<template>
  <v-card elevation="8" max-width="960" v-if="this.service">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header">
        {{ this.service.name }}
      </div>
      <v-chip
        :class="[i === 0 ? 'ml-4' : 'ml-2']"
        :color="wesVersionChipColor"
        :key="i"
        label
        small
        text-color="white"
        v-for="(wesVersion, i) in this.service.supportedWesVersions"
        >WES {{ wesVersion }}</v-chip
      >
      <v-spacer></v-spacer>
      <v-chip
        :color="getServiceStateColor(this.service.state)"
        class="mr-4"
        text-color="white"
      >
        {{ this.service.state }}
      </v-chip>
      <v-btn
        outlined
        :color="this.$colors.grey.darken2"
        small
        @click="reloadServiceState"
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </div>
    <div
      class="pl-12"
      :style="{
        fontSize: '14px',
        color: this.$colors.grey.darken4,
        fontWeight: '300'
      }"
    >
      {{ this.service.endpoint }}
    </div>
    <div class="d-flex px-12 pt-2 justify-space-between pb-6">
      <div
        :style="{ width: '47%' }"
        class="d-flex flex-column"
        v-if="this.workflowEngines.length"
      >
        <div :style="{ fontSize: '20px' }">
          Workflow Engines
        </div>
        <v-data-table
          :headers="workflowEngineHeaders"
          :items="this.workflowEngines"
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
      <div
        :style="{ width: '47%' }"
        class="d-flex flex-column"
        v-if="this.workflowLanguages.length"
      >
        <div :style="{ fontSize: '20px' }">Workflow Languages</div>
        <v-data-table
          :headers="workflowLanguageHeaders"
          :items="this.workflowLanguages"
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
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'
import { Service } from '@/store/service'
import { WorkflowTypeVersion } from '@/utils/types'

type DataObj = {
  wesVersionChipColor: string
  workflowEngineHeaders: DataTableHeader[]
  workflowLanguageHeaders: DataTableHeader[]
}

type WorkflowEngine = {
  name: string
  version: string
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
      wesVersionChipColor: this.$colors.indigo.lighten2,
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
      return this.$store.state.service.services.filter(
        (service: Service) => service.uuid === this.serviceId
      )[0]
    },
    workflowEngines(): WorkflowEngine[] {
      return Object.entries(this.service.workflowEngineVersions).map(
        ([engineName, engineVersion]: [string, string]): WorkflowEngine => {
          return { name: engineName, version: engineVersion }
        }
      )
    },
    workflowLanguages(): WorkflowLanguage[] {
      return Object.entries(this.service.workflowTypeVersions).map(
        ([name, versions]: [string, WorkflowTypeVersion]): WorkflowLanguage => {
          return {
            name: name,
            versions: versions.workflow_type_version
          }
        }
      )
    }
  },
  methods: {
    getServiceStateColor(serviceState: string): string {
      if (serviceState === 'Available') return this.$colors.green.darken1
      else if (serviceState === 'Disconnect') return this.$colors.red.darken1
      else if (serviceState === 'Unknown') return this.$colors.grey.darken1
      else return this.$colors.grey.darken1
    },
    reloadServiceState(): void {
      alert('Reload state') // TODO
    }
  }
})
</script>
