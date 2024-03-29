<template>
  <v-card max-width="1200">
    <div class="d-flex align-center mx-6 pt-4">
      <v-icon color="black" left v-text="'mdi-graph-outline'" />
      <div class="card-header" v-text="'Workflows'" />
      <v-spacer />
      <v-select
        v-if="workflowTableItems.length"
        v-model="filterType"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        :items="workflowTypes"
        label="Type"
        :prepend-inner-icon="'mdi-filter-outline'"
        single-line
        :style="{ maxWidth: '160px', minWidth: '160px' }"
      />
      <v-text-field
        v-if="workflowTableItems.length"
        v-model="filterName"
        class="mt-2 mr-6"
        clearable
        dense
        hide-details
        label="Name"
        :prepend-inner-icon="'mdi-magnify'"
        single-line
        :style="{ maxWidth: '200px', minWidth: '200px' }"
      />
    </div>

    <div v-if="!workflowTableItems.length" class="mx-12 my-2">
      <span
        :style="{
          color: $vuetify.theme.themes.light.error,
          textDecorationLine: 'underline',
          fontSize: '1rem',
        }"
        v-text="'Add workflow to start composing a run.'"
      />
    </div>

    <v-data-table
      v-if="workflowTableItems.length"
      class="mx-12 my-2 workflow-table"
      :headers="workflowHeaders"
      item-key="workflowId"
      :items="filteredItems"
      :items-per-page="Number(10)"
    >
      <template #[`item.workflowType`]="{ item }">
        <workflow-icon :wf-type="item.workflowType" />
      </template>
      <template #[`item.workflowName`]="{ item }">
        <div class="d-flex">
          <nuxt-link
            :style="{ textDecoration: 'none' }"
            :to="{ path: '/workflows', query: { workflowId: item.workflowId } }"
            v-text="item.workflowName"
          />
          <v-tooltip top>
            <template #activator="{ on }">
              <v-icon
                v-if="item.preRegistered"
                class="ml-2"
                :color="$colors.indigo.darken1"
                small
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
          <template #activator="{ on }">
            <div v-on="item.preRegistered && on">
              <v-icon
                :color="$colors.grey.darken2"
                :disabled="item.preRegistered"
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

    <div class="d-flex justify-end pb-6 mr-12 mt-2">
      <v-tooltip max-width="400" top>
        <template #activator="{ on }">
          <v-btn
            color="primary"
            :disabled="registeredOnlyMode"
            outlined
            width="140"
            v-on="registeredOnlyMode && on"
            @click.stop="registerDialogShow = true"
          >
            <v-icon left v-text="'mdi-sticker-plus-outline'" />
            <span v-text="'Add'" />
          </v-btn>
        </template>
        <span
          v-text="
            'This WES endpoint operates in the mode of pre-registering workflows. Would you please ask your administrator to add workflows?'
          "
        />
      </v-tooltip>
      <v-tooltip max-width="400" top>
        <template #activator="{ on }">
          <v-btn
            class="ml-4"
            color="primary"
            :disabled="registeredOnlyMode"
            outlined
            width="140"
            v-on="registeredOnlyMode && on"
            @click.stop="importDialogShow = true"
          >
            <v-icon left v-text="'mdi-application-import'" />
            <span v-text="'Import'" />
          </v-btn>
        </template>
        <span
          v-text="
            'This WES endpoint operates in the mode of pre-registering workflows. Would you please ask your administrator to import workflows?'
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

    <workflow-trs-import-dialog
      :dialog-show="importDialogShow"
      :service-id="serviceId"
      @close="importDialogShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify/types'
import { defineComponent } from 'vue'
import { Service } from '@/store/services'
import { WorkflowTableItem } from '@/store/workflows'
import WorkflowDeleteDialog from '@/components/services/WorkflowDeleteDialog.vue'
import WorkflowIcon from '@/components/WorkflowIcon.vue'
import WorkflowRegisterDialog from '@/components/services/WorkflowRegisterDialog.vue'
import WorkflowTrsImportDialog from '@/components/services/WorkflowTrsImportDialog.vue'

export default defineComponent({
  components: {
    WorkflowDeleteDialog,
    WorkflowIcon,
    WorkflowRegisterDialog,
    WorkflowTrsImportDialog,
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
      ] as DataTableHeader[],
      selectedWorkflows: [] as WorkflowTableItem[],
      registerDialogShow: false,
      importDialogShow: false,
      deleteDialogShow: false,
      filterType: '',
      filterName: '',
    }
  },

  computed: {
    service(): Service {
      return this.$store.getters['services/service'](this.serviceId)
    },

    workflowTableItems(): WorkflowTableItem[] {
      return this.$store.getters['workflows/tableItems'](
        this.service.workflowIds
      )
    },

    filteredItems(): WorkflowTableItem[] {
      return this.workflowTableItems.filter((item: WorkflowTableItem) => {
        if (this.filterType && item.workflowType !== this.filterType) {
          return false
        }
        if (this.filterName && !item.workflowName.includes(this.filterName)) {
          return false
        }
        return true
      })
    },

    registeredOnlyMode(): boolean {
      return this.$store.getters['services/registeredOnlyMode'](this.serviceId)
    },

    workflowTypes(): string[] {
      return Array.from(
        new Set(this.workflowTableItems.map((item) => item.workflowType))
      )
    },
  },
})
</script>

<style scoped>
.workflow-table >>> td:first-child {
  padding-right: 0px;
}
</style>
