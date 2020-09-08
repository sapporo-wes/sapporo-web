<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header pl-6 pt-4" v-text="'WES Services'" />
    <div v-if="!services.length" class="my-2">
      <not-exist-message :content="`WES services`" />
    </div>
    <v-data-table
      :headers="serviceHeaders"
      :items-per-page="Number(5)"
      :items="services"
      calculate-widths
      class="mx-6 my-2"
      item-key="id"
      show-select
      v-else
      v-model="selectedServices"
    >
      <template v-slot:[`item.name`]="{ item }">
        <nuxt-link
          :to="`/service/${item.id}`"
          class="text-decoration-none"
          v-text="item.name"
        />
      </template>
      <template v-slot:[`item.addedDate`]="{ item }">
        {{ item.addedDate | formatDate }}
      </template>
      <template v-slot:[`item.state`]="{ item }">
        <v-chip
          :color="getServiceStateColor(item.state)"
          text-color="white"
          v-text="item.state"
        />
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        :color="$colors.indigo.darken4"
        @click.stop="registerDialogShow = true"
        class="mr-4"
        outlined
      >
        <v-icon class="mr-2">mdi-sticker-plus-outline</v-icon>Register
      </v-btn>
      <v-btn
        :color="$colors.red.darken4"
        :disabled="!selectedServices.length"
        @click.stop="deleteDialogShow = true"
        outlined
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>
    <register-dialog
      :dialogShow="registerDialogShow"
      @close="registerDialogShow = false"
      @clearSelected="selectedServices = []"
      @error="errorSnackbar = true"
    />
    <delete-dialog
      :dialogShow="deleteDialogShow"
      :modelType="'service'"
      :selectedItems="selectedServices"
      @close="deleteDialogShow = false"
    />
    <v-snackbar
      :color="$colors.red.lighten1"
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
import DeleteDialog from '@/components/DeleteDialog.vue'
import NotExistMessage from '@/components/NotExistMessage.vue'
import RegisterDialog from '@/components/index/RegisterDialog.vue'
import { Service } from '@/types'
import moment from 'moment'

type DataObj = {
  serviceHeaders: DataTableHeader[]
  selectedServices: Service[]
  registerDialogShow: boolean
  deleteDialogShow: boolean
  errorSnackbar: boolean
}

export default Vue.extend({
  components: {
    DeleteDialog,
    NotExistMessage,
    RegisterDialog
  },
  data(): DataObj {
    return {
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
          text: 'Added Date',
          value: 'addedDate'
        },
        {
          text: 'State',
          value: 'state'
        }
      ],
      selectedServices: [],
      registerDialogShow: false,
      deleteDialogShow: false,
      errorSnackbar: false
    }
  },
  computed: {
    services() {
      return this.$store.getters['service/servicesList']
    }
  },
  methods: {
    getServiceStateColor(serviceState: string): string {
      if (serviceState === 'Available') return this.$colors.green.darken1
      else if (serviceState === 'Disconnect') return this.$colors.red.darken1
      else if (serviceState === 'Unknown') return this.$colors.grey.darken1
      return this.$colors.grey.darken1
    }
  },
  filters: {
    formatDate(date: Date): string {
      return moment(date).format('YYYY-MM-DD hh:mm:ss')
    }
  }
})
</script>
