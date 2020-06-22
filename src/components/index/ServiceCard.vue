<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header pl-6 pt-4">
      WES Services
    </div>
    <div v-if="!this.services.length" class="my-2">
      <p class="info--text" style="font-size: 16px; padding-left: 60px;">
        <span
          :style="{
            color: this.$colors.red.darken4,
            textDecorationLine: 'underline'
          }"
          >NO WES services are registered.</span
        >
        Click
        <span :style="{ color: this.$colors.indigo.darken4 }">RESISTER</span>
        button.
      </p>
    </div>
    <v-data-table
      :headers="serviceHeaders"
      :items-per-page="serviceTableItemPerNum"
      :items="services"
      calculate-widths
      class="info--text mx-6 my-2"
      item-key="name"
      show-select
      v-if="this.services.length"
      v-model="selectedServices"
    >
      <template v-slot:item.state="{ item }">
        <v-chip :color="getServiceStateColor(item.state)" text-color="white">
          {{ item.state }}
        </v-chip>
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn :color="this.$colors.indigo.darken4" class="mr-4" outlined>
        <v-icon class="mr-2">mdi-sticker-plus-outline</v-icon>Register
      </v-btn>
      <v-btn
        :color="this.$colors.red.darken4"
        :disabled="!this.selectedServices.length"
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

type service = {
  name: string
  endpoint: string
  state: string
}

type dataObject = {
  serviceTableItemPerNum: number
  serviceHeaders: DataTableHeader[]
  services: service[]
  selectedServices: service[]
}

export default Vue.extend({
  data(): dataObject {
    return {
      serviceTableItemPerNum: 5,
      serviceHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Endpoint',
          value: 'endpoint'
        },
        {
          text: 'State',
          value: 'state'
        }
      ],
      services: [
        {
          name: 'TestService1',
          endpoint: 'https://test-service-1:8080',
          state: 'Available'
        },
        {
          name: 'TestService2',
          endpoint: 'https://test-service-2:8080',
          state: 'Available'
        },
        {
          name: 'TestService3',
          endpoint: 'https://test-service-3:8080',
          state: 'Disconnect'
        },
        {
          name: 'TestService4',
          endpoint: 'https://test-service-4:8080',
          state: 'Unknown'
        }
      ],
      selectedServices: []
    }
  },
  methods: {
    getServiceStateColor(serviceState: string): string {
      if (serviceState === 'Available') return this.$colors.green.darken1
      else if (serviceState === 'Disconnect') return this.$colors.red.darken1
      else if (serviceState === 'Unknown') return this.$colors.grey.darken1
      else return this.$colors.grey.darken1
    }
  }
})
</script>
