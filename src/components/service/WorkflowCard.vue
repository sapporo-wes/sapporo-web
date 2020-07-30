<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header pl-6 pt-4" v-text="'Workflows'" />
    <div v-if="!workflows.length" class="my-2">
      <not-exist-message :content="'workflows'" />
    </div>
    <v-data-table
      :headers="workflowHeaders"
      :items-per-page="Number(5)"
      :items="workflows"
      calculate-widths
      class="mx-6 my-2"
      item-key="id"
      show-select
      v-else
      v-model="selectedWorkflows"
    >
      <template v-slot:item.name="{ item }">
        <nuxt-link
          :to="`/workflow/${item.id}`"
          class="text-decoration-none"
          v-text="item.name"
        />
      </template>
      <template v-slot:item.type="{ item }">
        {{ item.type }} {{ item.version }}
      </template>
      <template v-slot:item.date="{ item }">
        {{ item.addedDate | formatDate }}
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
        :disabled="!selectedWorkflows.length"
        @click.stop="deleteDialogShow = true"
        outlined
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>
    <register-dialog
      :dialogShow="registerDialogShow"
      :service-id="serviceId"
      @close="registerDialogShow = false"
      @error="errorSnackbar = true"
    />
    <delete-dialog
      :dialogShow="deleteDialogShow"
      :modelType="'workflow'"
      :selectedItems="selectedWorkflows"
      @clearSelected="selectedWorkflows = []"
      @close="deleteDialogShow = false"
    />
    <v-snackbar
      :color="$colors.red.lighten1"
      elevation="8"
      top
      v-model="errorSnackbar"
    >
      Error!! There's something problem with the values you inputted.
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'
import DeleteDialog from '@/components/DeleteDialog.vue'
import NotExistMessage from '@/components/NotExistMessage.vue'
import RegisterDialog from '@/components/service/RegisterDialog.vue'
import { FormComponent, Rule, Service, Workflow } from '@/types'
import moment from 'moment'

type DataObj = {
  workflowHeaders: DataTableHeader[]
  selectedWorkflows: Workflow[]
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
  props: {
    serviceId: {
      type: String,
      required: true
    }
  },
  data(): DataObj {
    return {
      workflowHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Type',
          value: 'type'
        },
        {
          text: 'Added Date',
          value: 'date'
        }
      ],
      selectedWorkflows: [],
      registerDialogShow: false,
      deleteDialogShow: false,
      errorSnackbar: false
    }
  },
  computed: {
    service(): Service {
      return this.$store.getters['service/serviceFilteredById'](this.serviceId)
    },
    workflows(): Workflow[] {
      return this.$store.state.workflow.workflows
    }
  },
  filters: {
    formatDate(date: Date): string {
      return moment(date).format('YYYY-MM-DD hh:mm:ss')
    }
  }
})
</script>
