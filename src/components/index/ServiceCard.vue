<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header pl-6 pt-4">
      WES Services
    </div>
    <div v-if="!this.services.length" class="my-2">
      <p class="info--text" :style="{ fontSize: '16px', paddingLeft: '60px' }">
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
      item-key="uuid"
      show-select
      v-if="this.services.length"
      v-model="selectedServices"
    >
      <template v-slot:item.name="{ item }">
        <nuxt-link class="text-decoration-none" :to="`/service/${item.uuid}`">
          {{ item.name }}
        </nuxt-link>
      </template>
      <template v-slot:item.addedDate="{ item }">
        {{ item.addedDate | formatDate }}
      </template>
      <template v-slot:item.state="{ item }">
        <v-chip :color="getServiceStateColor(item.state)" text-color="white">
          {{ item.state }}
        </v-chip>
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        :color="this.$colors.indigo.darken4"
        @click.stop="openRegisterDialog"
        class="mr-4"
        outlined
      >
        <v-icon class="mr-2">mdi-sticker-plus-outline</v-icon>Register
      </v-btn>
      <v-btn
        :color="this.$colors.red.darken4"
        :disabled="!this.selectedServices.length"
        @click="deleteService"
        outlined
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>
    <v-dialog overlay-opacity="0.8" v-model="registerShow" width="600">
      <v-card>
        <div class="card-header pl-6 pt-4">
          Register Service
        </div>
        <v-form class="px-12 py-2" lazy-validation ref="form" v-model="valid">
          <v-text-field
            :rules="nameRules"
            label="Name"
            required
            v-model="inputtedName"
          ></v-text-field>
          <v-text-field
            :rules="endpointRules"
            label="Endpoint"
            required
            v-model="inputtedEndpoint"
          ></v-text-field>
          <div class="d-flex justify-end pb-2">
            <v-btn
              :color="this.$colors.indigo.darken4"
              :disabled="!valid"
              @click="submitService"
              outlined
            >
              <v-icon class="mr-1">mdi-arrow-up</v-icon>Submit
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
    <v-snackbar
      :color="this.$colors.red.lighten1"
      elevation="8"
      top
      v-model="errorSnackbar"
    >
      Error!! There's something problem with the endpoint you inputted.
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'
import { Service } from '@/store/service'
import moment from 'moment'

type ValidResult = boolean | string
type Rule = (value: string) => ValidResult

type DataObj = {
  serviceTableItemPerNum: number
  serviceHeaders: DataTableHeader[]
  selectedServices: Service[]
  registerShow: boolean
  valid: boolean
  inputtedName: string
  nameRules: Rule[]
  inputtedEndpoint: string
  endpointRules: Rule[]
  errorSnackbar: boolean
}

type FormComponent = Vue & {
  validate: () => boolean
  reset: () => boolean
  resetValidation: () => boolean
}

export default Vue.extend({
  data(): DataObj {
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
          text: 'Date',
          value: 'addedDate'
        },
        {
          text: 'State',
          value: 'state'
        }
      ],
      selectedServices: [],
      registerShow: false,
      valid: false,
      inputtedName: '',
      nameRules: [(v) => !!v || 'Name is required.'],
      inputtedEndpoint: '',
      endpointRules: [(v) => !!v || 'Endpoint is required.'],
      errorSnackbar: false
    }
  },
  computed: {
    services(): Service[] {
      return this.$store.state.service.services
    },
    serviceNames(): string[] {
      return this.$store.getters['service/getServiceNames']
    }
  },
  methods: {
    getServiceStateColor(serviceState: string): string {
      if (serviceState === 'Available') return this.$colors.green.darken1
      else if (serviceState === 'Disconnect') return this.$colors.red.darken1
      else if (serviceState === 'Unknown') return this.$colors.grey.darken1
      else return this.$colors.grey.darken1
    },
    openRegisterDialog(): void {
      this.registerShow = true
    },
    async submitService(): Promise<void> {
      const validationResult = (this.$refs.form as FormComponent).validate()
      if (validationResult) {
        await this.$store
          .dispatch('service/submitService', {
            name: this.inputtedName,
            endpoint: this.inputtedEndpoint
          })
          .catch((err) => {
            this.errorSnackbar = true
            console.error(err)
          })
        ;(this.$refs.form as FormComponent).reset()
      }
    },
    async deleteService(): Promise<void> {
      await this.$store.dispatch(
        'service/deleteService',
        this.selectedServices.map((service) => service.uuid)
      )
      this.selectedServices = []
    },
    existName(name: string): boolean {
      return this.serviceNames.includes(name)
    },
    validEndpoint(endpoint: string): boolean {
      let url
      try {
        url = new URL(endpoint)
      } catch (_) {
        return false
      }
      return url.protocol === 'http:' || url.protocol === 'https:'
    }
  },
  created() {
    this.nameRules.push(
      (v) => !this.existName(v) || `Name ${v} already exists.`
    )
    this.endpointRules.push(
      (v) => this.validEndpoint(v) || `Endpoint ${v} does not valid.`
    )
  },
  filters: {
    formatDate(date: Date): string {
      return moment(date).format('YYYY-MM-DD hh:mm:ss')
    }
  }
})
</script>
