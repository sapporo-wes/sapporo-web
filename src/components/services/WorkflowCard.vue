<template>
  <v-card max-width="1200">
    <div class="d-flex px-6 pt-4">
      <v-icon color="black" class="mr-2" v-text="'mdi-graph-outline'" />
      <div class="card-header" v-text="'Workflows'" />
    </div>

    <div v-if="!workflowTableItems.length" class="my-2">
      <div class="mx-12">
        <span
          :style="{
            color: $vuetify.theme.themes.light.error,
            textDecorationLine: 'underline',
            fontSize: '1rem',
          }"
          v-text="'Add workflow to start composing a run.'"
        />
      </div>
    </div>

    <v-data-table
      v-if="workflowTableItems.length"
      :headers="workflowHeaders"
      :items-per-page="Number(10)"
      :items="workflowTableItems"
      class="mx-12 my-2 workflow-table"
      item-key="workflowId"
    >
      <template #[`item.workflowType`]="{ item }">
        <v-tooltip top max-width="400">
          <template #activator="{ on, attrs }">
            <img
              v-if="item.workflowType.toLowerCase() === 'cwl'"
              src="~/assets/icon/cwl-icon.png"
              class="pt-2"
              height="40"
              v-bind="attrs"
              v-on="on"
            />
            <img
              v-else-if="item.workflowType.toLowerCase() === 'wdl'"
              src="~/assets/icon/wdl-icon.png"
              class="pt-2"
              height="40"
              v-bind="attrs"
              v-on="on"
            />
            <img
              v-else-if="item.workflowType.toLowerCase() === 'nextflow'"
              src="~/assets/icon/nextflow-icon.png"
              class="pt-2"
              height="40"
              v-bind="attrs"
              v-on="on"
            />
            <img
              v-else-if="item.workflowType.toLowerCase() === 'snakemake'"
              src="~/assets/icon/snakemake-icon.png"
              class="pt-2"
              height="40"
              v-bind="attrs"
              v-on="on"
            />
            <template v-else>
              <v-icon
                v-bind="attrs"
                class="py-2 pr-2"
                v-on="on"
                v-text="'mdi-beaker-question-outline'"
              />
            </template>
          </template>
          <span v-text="`${item.workflowType} ${item.workflowVersion}`" />
        </v-tooltip>
      </template>
      <template #[`item.workflowName`]="{ item }">
        <div class="d-flex">
          <nuxt-link
            :to="{ path: '/workflows', query: { workflowId: item.workflowId } }"
            v-text="item.workflowName"
          />
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon
                v-if="item.preRegistered"
                :color="$colors.indigo.darken1"
                class="ml-2"
                small
                v-bind="attrs"
                v-on="on"
                v-text="'mdi-account-check-outline'"
              />
            </template>
            <span v-text="'Pre-registered workflow'" />
          </v-tooltip>
        </div>
      </template>
      <template #[`item.delete`]="{ item }">
        <v-tooltip top>
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" v-on="item.preRegistered && on">
              <v-icon
                :disabled="item.preRegistered"
                :color="$colors.grey.darken2"
                @click.stop="
                  selectedWorkflows = [item]
                  deleteDialogShow = true
                "
                v-text="'mdi-trash-can-outline'"
              />
            </div>
          </template>
          <span
            v-text="'This workflow is pre-registered and cannot be removed.'"
          />
        </v-tooltip>
      </template>
    </v-data-table>

    <div class="d-flex justify-end pb-6 pr-12">
      <v-tooltip top max-width="400">
        <template #activator="{ on, attrs }">
          <div v-bind="attrs" v-on="registeredOnlyMode && on">
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
            'This WES service operates in the mode of pre-registering workflows. Would you please ask your administrator to add workflows?'
          "
        />
      </v-tooltip>
    </div>

    <workflow-register-dialog
      :dialog-show="registerDialogShow"
      :service-id="serviceId"
      @close="registerDialogShow = false"
    />

    <workflow-delete-dialog
      :dialog-show="deleteDialogShow"
      :selected-items="selectedWorkflows"
      @close="
        deleteDialogShow = false
        selectedWorkflow = []
      "
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import Vue from 'vue'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Service } from '@/store/services'
import { WorkflowTableItem } from '@/store/workflows'
import WorkflowDeleteDialog from '@/components/services/WorkflowDeleteDialog.vue'
import WorkflowRegisterDialog from '@/components/services/WorkflowRegisterDialog.vue'

type Data = {
  workflowHeaders: DataTableHeader[]
  selectedWorkflows: WorkflowTableItem[]
  registerDialogShow: boolean
  deleteDialogShow: boolean
}

type Methods = Record<string, unknown>

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
          text: '',
          value: 'workflowType',
          sortable: false,
          width: '40px',
        },
        {
          text: 'Name',
          value: 'workflowName',
          sortable: true,
        },
        {
          text: 'Added / Updated Date',
          value: 'date',
          sortable: true,
        },
        {
          text: '',
          value: 'delete',
          sortable: false,
          align: 'center',
          width: '64px',
        },
      ],
      selectedWorkflows: [],
      registerDialogShow: false,
      deleteDialogShow: false,
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
}

export default Vue.extend(options)
</script>

<style scoped>
.workflow-table >>> td:first-child {
  padding-right: 0px;
}
</style>
