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
          v-text="'Workflow is not registered.'"
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
      <template #[`item.date`]="{ item }">
        {{
          item.preRegistered
            ? $dayjs(item.updatedDate).local().format('YYYY-MM-DD HH:mm:ss')
            : $dayjs(item.addedDate).local().format('YYYY-MM-DD HH:mm:ss')
        }}
      </template>
      <template #[`item.preRegistered`]="{ item }">
        <v-icon v-if="item.preRegistered" v-text="'mdi-check'" />
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
      <v-tooltip :value="tooltipShow" top color="primary" max-width="300">
        <template #activator="{}">
          <v-btn
            :disabled="registeredOnlyMode"
            class="mr-4"
            color="primary"
            outlined
            width="140"
            @click.stop="registerDialogShow = true"
            @mouseover="overRegisterButton"
            @mouseleave="tooltipShow = false"
          >
            <v-icon class="mr-2" v-text="'mdi-sticker-plus-outline'" />
            <span v-text="'Register'" />
          </v-btn>
        </template>
        <span
          >This service is running in a mode that executes only pre-registered
          workflows, so it is not possible to register workflows.</span
        >
      </v-tooltip>
      <v-btn
        :disabled="!selectedWorkflows.length"
        color="error"
        outlined
        width="140"
        @click.stop="deleteDialogShow = true"
      >
        <v-icon class="mr-2" v-text="'mdi-trash-can-outline'" />
        <span v-text="'Delete'" />
      </v-btn>
    </div>

    <workflow-register-dialog
      :dialog-show="registerDialogShow"
      :service-id="serviceId"
      @close="registerDialogShow = false"
    />

    <workflow-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedWorkflows"
      @clear-selected="selectedWorkflows = []"
      @close="deleteDialogShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import Vue from 'vue'
import WorkflowDeleteDialog from '@/components/services/WorkflowDeleteDialog.vue'
import WorkflowRegisterDialog from '@/components/services/WorkflowRegisterDialog.vue'

import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'

type Data = {
  workflowHeaders: DataTableHeader[]
  selectedWorkflows: Workflow[]
  registerDialogShow: boolean
  deleteDialogShow: boolean
  tooltipShow: boolean
}

type Methods = {
  overRegisterButton: () => void
}

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
          text: 'Added / Updated Date',
          value: 'date',
        },
        {
          text: 'Pre-registered',
          value: 'preRegistered',
        },
      ],
      selectedWorkflows: [],
      registerDialogShow: false,
      deleteDialogShow: false,
      tooltipShow: false,
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

  methods: {
    overRegisterButton() {
      if (this.$store.getters['services/registeredOnlyMode'](this.serviceId)) {
        this.tooltipShow = true
      }
    },
  },
}

export default Vue.extend(options)
</script>
