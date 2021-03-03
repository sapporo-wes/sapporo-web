<template>
  <v-card elevation="8" max-width="1200">
    <div class="card-header pl-6 pt-4" v-text="'Workflows'" />
    <div v-if="!workflows.length" class="my-2">
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
          v-text="'NO workflows are registered.'"
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
      v-if="workflows.length"
      v-model="selectedWorkflows"
      :headers="workflowHeaders"
      :items-per-page="Number(5)"
      :items="workflows"
      calculate-widths
      class="mx-6 my-2"
      item-key="id"
      multi-sort
      show-select
    >
      <template #[`item.name`]="{ item }">
        <nuxt-link
          :to="{ path: '/workflows', query: { workflowId: item.id } }"
          v-text="item.name"
        />
      </template>
      <template #[`item.type`]="{ item }">
        {{ item.type }} {{ item.version }}
      </template>
      <template #[`item.addedDate`]="{ item }">
        {{ item.addedDate | formatDate }}
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        :disabled="registeredOnlyMode"
        class="mr-4"
        color="primary"
        outlined
        @click.stop="registerDialogShow = true"
      >
        <v-icon class="mr-2">mdi-sticker-plus-outline</v-icon>Register
      </v-btn>
      <v-btn
        :disabled="!selectedWorkflows.length"
        color="error"
        outlined
        @click.stop="deleteDialogShow = true"
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>

    <workflow-register-dialog
      :dialog-show="registerDialogShow"
      :service-id="serviceId"
      @close="registerDialogShow = false"
      @error="errorSnackbar = true"
    />

    <workflow-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedWorkflows"
      @close="deleteDialogShow = false"
    />

    <v-snackbar v-model="errorSnackbar" color="error" elevation="8" top>
      Error!! There's something problem with the values you inputted.
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import dayjs from 'dayjs'
import Vue from 'vue'
import WorkflowDeleteDialog from '@/components/services/WorkflowDeleteDialog.vue'
import WorkflowRegisterDialog from '@/components/services/WorkflowRegisterDialog.vue'

import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'

type Data = {
  workflowHeaders: DataTableHeader[]
  selectedWorkflows: Workflow[]
  registerDialogShow: boolean
  deleteDialogShow: boolean
  errorSnackbar: boolean
  errorMessage: string
}

type Methods = Record<string, never>

type Computed = {
  service: Service
  workflows: Workflow[]
  registeredOnlyMode: boolean
}

type Props = {
  serviceId: string
}

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  components: {
    WorkflowDeleteDialog,
    WorkflowRegisterDialog,
  },

  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      workflowHeaders: [
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Type Version',
          value: 'type',
        },
        {
          text: 'Added Date',
          value: 'addedDate',
        },
      ],
      selectedWorkflows: [],
      registerDialogShow: false,
      deleteDialogShow: false,
      errorSnackbar: false,
      errorMessage:
        "Error!! There's something problem with the values you inputted.",
    }
  },

  computed: {
    service() {
      return this.$store.getters['services/service'](this.serviceId)
    },

    workflows() {
      return this.$store.getters['workflows/workflowsByIds'](
        this.service.workflowIds
      )
    },

    registeredOnlyMode() {
      return this.$store.getters['services/registeredOnlyMode'](this.serviceId)
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
