<template>
  <v-card max-width="1200">
    <div class="card-header px-6 pt-4" v-text="'WES Services'" />
    <div v-if="!services.length" class="my-2">
      <div class="mx-12">
        <span
          :style="{
            fontSize: '1rem',
          }"
        >
          <span
            :style="{
              color: $vuetify.theme.themes.light.error,
              textDecorationLine: 'underline',
            }"
          >
            Register a WES service to run workflows.
          </span>
        </span>
        <br />
        <div class="my-2">
          <span>
            Use a public WES service, or run your own using
            <a href="https://github.com/ddbj/sapporo-service"
              >Sapporo-service</a
            >
          </span>
        </div>
      </div>
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
        <div class="d-flex align-center">
          <nuxt-link
            :to="{ path: '/services', query: { serviceId: item.id } }"
            v-text="item.name"
          />
          <v-chip
            v-text="'Pre-registered'"
            :color="$colors.blueGrey.darken1"
            label
            small
            text-color="white"
            class="ml-4"
            v-if="item.preRegistered"
          />
        </div>
      </template>
      <template #[`item.addedDate`]="{ item }">
        {{ $dayjs(item.addedDate).local().format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template #[`item.preRegistered`]="{ item }">
        <v-icon v-if="item.preRegistered" v-text="'mdi-check'" />
      </template>
      <template #[`item.state`]="{ item }">
        <v-chip
          :color="$store.getters['services/stateColor'](item.id)"
          text-color="white"
          v-text="item.state || ''"
        />
      </template>
      <template #[`item.data-table-select`]="{ item, isSelected, select }">
        <v-simple-checkbox
          :disabled="item.preRegistered"
          :value="isSelected"
          @input="select"
        />
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        color="primary"
        class="mr-4"
        outlined
        width="140"
        @click.stop="registerDialogShow = true"
      >
        <v-icon class="mr-2" v-text="'mdi-sticker-plus-outline'" />
        <span v-text="'Register'" />
      </v-btn>
      <v-btn
        :disabled="!selectedServices.length"
        color="error"
        outlined
        width="140"
        @click.stop="deleteDialogShow = true"
      >
        <v-icon class="mr-2" v-text="'mdi-trash-can-outline'" />
        <span v-text="'Remove'" />
      </v-btn>
    </div>

    <service-register-dialog
      :dialog-show="registerDialogShow"
      @close="registerDialogShow = false"
    />

    <service-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedServices"
      @close="deleteDialogShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import ServiceDeleteDialog from '@/components/index/ServiceDeleteDialog.vue'
import ServiceRegisterDialog from '@/components/index/ServiceRegisterDialog.vue'
import Vue from 'vue'

type Data = {
  serviceHeaders: DataTableHeader[]
  selectedServices: Service[]
  registerDialogShow: boolean
  deleteDialogShow: boolean
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
    }
  },

  computed: {
    services() {
      return this.$store.getters['services/services']
    },
  },
}

export default Vue.extend(options)
</script>
