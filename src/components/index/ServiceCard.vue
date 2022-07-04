<template>
  <v-card max-width="1200">
    <div class="d-flex mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-dns-outline'" />
      <div class="card-header" v-text="'WES Instances'" />
    </div>

    <div v-if="!services.length" class="my-2">
      <div class="mx-12">
        <span
          :style="{
            color: $vuetify.theme.themes.light.error,
            textDecorationLine: 'underline',
            fontSize: '1rem',
          }"
          v-text="'Register a WES instance to run workflows.'"
        />
        <br />
        <div class="my-2">
          <span>
            Use a public WES instance, or run your own using the
            <a href="https://github.com/sapporo-wes/sapporo-service">
              sapporo-service
            </a>
          </span>
        </div>
      </div>
    </div>

    <v-data-table
      v-if="services.length"
      v-model="selectedServices"
      :headers="serviceHeaders"
      :items-per-page="Number(-1)"
      :items="services"
      class="mx-12 my-2"
      hide-default-footer
      item-key="id"
    >
      <template #[`item.name`]="{ item }">
        <div class="d-flex">
          <nuxt-link
            :to="{ path: '/services', query: { serviceId: item.id } }"
            :style="{ textDecoration: 'none' }"
            v-text="item.name"
          />
          <v-tooltip v-if="item.preRegistered" top>
            <template #activator="{ on }">
              <v-icon
                :color="$colors.indigo.darken1"
                class="ml-2"
                small
                v-on="on"
                v-text="'mdi-account-check-outline'"
              />
            </template>
            <span v-text="'Pre-registered WES instance'" />
          </v-tooltip>
        </div>
      </template>
      <template #[`item.addedDate`]="{ item }">
        <span
          v-text="$dayjs(item.addedDate).local().format('YYYY-MM-DD HH:mm:ss')"
        />
      </template>
      <template #[`item.state`]="{ item }">
        <v-chip
          :color="$store.getters['services/stateColor'](item.id)"
          text-color="white"
          v-text="item.state"
        />
      </template>
      <template #[`item.delete`]="{ item }">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-icon
              :disabled="item.preRegistered"
              :color="$colors.grey.darken2"
              v-on="item.preRegistered && on"
              @click.stop="
                selectedServices = [item]
                deleteDialogShow = true
              "
              v-text="'mdi-trash-can-outline'"
            />
          </template>
          <span
            v-text="'This service is pre-registered and cannot be removed.'"
          />
        </v-tooltip>
      </template>
    </v-data-table>

    <div class="d-flex justify-end pb-6 mr-12 mt-4">
      <v-btn
        color="primary"
        outlined
        width="140"
        @click.stop="registerDialogShow = true"
      >
        <v-icon left v-text="'mdi-sticker-plus-outline'" />
        <span v-text="'Register'" />
      </v-btn>
    </div>

    <service-register-dialog
      :dialog-show="registerDialogShow"
      @close="registerDialogShow = false"
    />

    <service-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedServices"
      @close="
        deleteDialogShow = false
        selectedServices = []
      "
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { defineComponent } from 'vue'
import { Service } from '@/store/services'
import ServiceDeleteDialog from '@/components/index/ServiceDeleteDialog.vue'
import ServiceRegisterDialog from '@/components/index/ServiceRegisterDialog.vue'

export default defineComponent({
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
          sortable: true,
        },
        {
          text: 'Endpoint',
          value: 'endpoint',
          sortable: false,
        },
        {
          text: 'Added Date',
          value: 'addedDate',
          sortable: true,
        },
        {
          text: '',
          value: 'state',
          align: 'center',
          sortable: false,
          width: '80px',
        },
        {
          text: '',
          value: 'delete',
          sortable: false,
          align: 'center',
          width: '64px',
        },
      ] as DataTableHeader[],
      selectedServices: [] as Service[],
      registerDialogShow: false,
      deleteDialogShow: false,
    }
  },

  computed: {
    services() {
      return this.$store.getters['services/services']
    },
  },
})
</script>
