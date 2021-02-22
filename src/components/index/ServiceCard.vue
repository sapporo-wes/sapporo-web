<template>
  <v-card elevation="8" max-width="1200">
    <div class="card-header pl-6 pt-4" v-text="'WES Services'" />
    <div v-if="!services.length" class="my-2">
      <p
        :style="{
          fontSize: '1rem',
          paddingLeft: '60px',
        }"
      >
        <span
          :style="{
            color: $vuetify.theme.themes.light.error,
            textDecorationLine: 'underline',
          }"
          v-text="'NO WES services are registered.'"
        />
        Click
        <span
          :style="{ color: $vuetify.theme.themes.light.primary }"
          v-text="'REGISTER'"
        />
        button.
      </p>
    </div>

    <v-data-table
      v-if="services.length"
      v-model="selectedServices"
      :headers="serviceHeaders"
      :items-per-page="Number(5)"
      :items="services"
      calculate-widths
      class="mx-6 my-2"
      item-key="id"
      show-select
    >
      <template #[`item.name`]="{ item }">
        <nuxt-link
          :to="{ path: '/services', query: { serviceId: item.id } }"
          v-text="item.name"
        />
      </template>
      <template #[`item.addedDate`]="{ item }">
        {{ item.addedDate | formatDate }}
      </template>
      <template #[`item.state`]="{ item }">
        <v-chip
          :color="$store.getters['services/stateColor'](item.id)"
          text-color="white"
          v-text="item.state"
        />
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        color="primary"
        class="mr-4"
        outlined
        @click.stop="registerDialogShow = true"
      >
        <v-icon class="mr-2">mdi-sticker-plus-outline</v-icon>Register
      </v-btn>
      <v-btn
        :disabled="!selectedServices.length"
        color="error"
        outlined
        @click.stop="deleteDialogShow = true"
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>

    <service-register-dialog
      :dialog-show="registerDialogShow"
      @close="registerDialogShow = false"
      @error="registrationError"
    />

    <service-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedServices"
      @close="deleteDialogShow = false"
    />

    <v-snackbar v-model="errorSnackbar" color="error" elevation="8" top>
      {{ errorMessage }}
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import dayjs from 'dayjs'
import ServiceDeleteDialog from '@/components/index/ServiceDeleteDialog.vue'
import ServiceRegisterDialog from '@/components/index/ServiceRegisterDialog.vue'
import Vue from 'vue'

type Data = {
  serviceHeaders: DataTableHeader[]
  selectedServices: Service[]
  registerDialogShow: boolean
  deleteDialogShow: boolean
  errorSnackbar: boolean
  errorMessage: string
}

type Methods = {
  registrationError: (inputtedEndpoint: string) => void
}

type Computed = {
  services: Service[]
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
    ServiceDeleteDialog,
    ServiceRegisterDialog,
  },

  data() {
    return {
      serviceHeaders: [
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Endpoint',
          value: 'endpoint',
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
      selectedServices: [],
      registerDialogShow: false,
      deleteDialogShow: false,
      errorSnackbar: false,
      errorMessage:
        "Error!! There's something problem with the endpoint you inputted.",
    }
  },

  computed: {
    services() {
      return this.$store.getters['services/services']
    },
  },

  methods: {
    registrationError(inputtedEndpoint: string) {
      this.errorMessage = `Error!! There's something problem with the endpoint ${inputtedEndpoint} you inputted.`
      this.errorSnackbar = true
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
