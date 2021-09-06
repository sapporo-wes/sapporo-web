<template>
  <v-card elevation="8" max-width="1200">
    <div class="card-header pl-6 pt-4" v-text="'Workflows'" />
    <div v-if="!workflowTableItems.length" class="my-2">
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
            v-text="'Add workflow to start composing a run.'"
          />
          <!-- Click
          <span
            :style="{ color: $vuetify.theme.themes.light.primary }"
            v-text="'REGISTER'"
          />
          button. -->
        </span>
      </div>
    </div>
    <v-data-table
      v-if="workflowTableItems.length"
      v-model="selectedWorkflows"
      :headers="workflowHeaders"
      :items-per-page="Number(10)"
      :items="workflowTableItems"
      calculate-widths
      class="mx-6 my-2"
      item-key="workflowId"
      multi-sort
      show-select
    >
      <template #[`item.workflowName`]="{ item }">
        <div class="d-flex align-center">
          <nuxt-link
            :to="{ path: '/workflows', query: { workflowId: item.workflowId } }"
            v-text="item.workflowName"
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
          <div
            class="mr-4"
            @mouseover="overRegisterButton"
            @mouseleave="tooltipShow = false"
          >
            <v-btn
              :disabled="registeredOnlyMode"
              color="primary"
              outlined
              width="140"
              @click.stop="registerDialogShow = true"
            >
              <v-icon class="mr-2" v-text="'mdi-sticker-plus-outline'" />
              <span v-text="'Add'" />
            </v-btn>
          </div>
        </template>
        <span
          v-text="
            'The WES service is running in pre-registered only mode: ask administrator to add a workflow.'
          "
        />
      </v-tooltip>
      <v-btn
        :disabled="!selectedWorkflows.length"
        color="error"
        outlined
        width="140"
        @click.stop="deleteDialogShow = true"
      >
        <v-icon class="mr-2" v-text="'mdi-trash-can-outline'" />
        <span v-text="'Remove'" />
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
import { WorkflowTableItem } from '@/store/workflows'
import Vue from 'vue'
import WorkflowDeleteDialog from '@/components/services/WorkflowDeleteDialog.vue'
import WorkflowRegisterDialog from '@/components/services/WorkflowRegisterDialog.vue'

import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'

type Data = {
  workflowHeaders: DataTableHeader[]
  selectedWorkflows: WorkflowTableItem[]
  registerDialogShow: boolean
  deleteDialogShow: boolean
  tooltipShow: boolean
}

type Methods = {
  overRegisterButton: () => void
}

type Computed = {
  service: Service
  workflowTableItems: WorkflowTableItem[]
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
          value: 'workflowName',
        },
        {
          text: 'Type Version',
          value: 'workflowTypeVersion',
        },
        {
          text: 'Added / Updated Date',
          value: 'date',
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

    workflowTableItems() {
      return this.$store.getters['workflows/tableItems'](
        this.service.workflowIds
      )
    },

    registeredOnlyMode() {
      return this.$store.getters['services/registeredOnlyMode'](this.serviceId)
    },
  },

  methods: {
    overRegisterButton() {
      if (this.registeredOnlyMode) {
        this.tooltipShow = true
      }
    },
  },
}

export default Vue.extend(options)
</script>
