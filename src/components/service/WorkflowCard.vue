<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header pl-6 pt-4">
      Workflows
    </div>
    <div v-if="!this.workflows.length" class="my-2">
      <p class="info--text" :style="{ fontSize: '16px', paddingLeft: '60px' }">
        <span
          :style="{
            color: this.$colors.red.darken4,
            textDecorationLine: 'underline'
          }"
          >NO workflows are registered.</span
        >
        Click
        <span :style="{ color: this.$colors.indigo.darken4 }">RESISTER</span>
        button.
      </p>
    </div>
    <v-data-table
      :headers="workflowHeaders"
      :items-per-page="workflowTableItemPerNum"
      :items="workflows"
      calculate-widths
      class="info--text mx-6 my-2"
      item-key="uuid"
      show-select
      v-if="this.workflows.length"
      v-model="selectedWorkflows"
    >
      <template v-slot:item.name="{ item }">
        <nuxt-link :to="`/workflow/${item.uuid}`" class="text-decoration-none">
          {{ item.name }}
        </nuxt-link>
      </template>
      <template v-slot:item.type="{ item }">
        {{ item.type }}: {{ item.version }}
      </template>
      <template v-slot:item.date="{ item }">
        {{ item.addedDate | formatDate }}
      </template>
    </v-data-table>
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        :color="this.$colors.indigo.darken4"
        @click.stop="openRegisterDialog"
        class="mr-4"
        outlined
      >
        <v-icon class="mr-2">mdi-sticker-plus-outline</v-icon>Register
      </v-btn>
      <v-btn
        :color="this.$colors.red.darken4"
        :disabled="!this.selectedWorkflows.length"
        @click="openDeleteDialog"
        outlined
      >
        <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
      </v-btn>
    </div>
    <v-dialog overlay-opacity="0.8" v-model="registerDialogShow" width="600">
      <v-card>
        <div class="card-header pl-6 pt-4">
          Register Workflow
        </div>
        <v-form
          class="px-12 py-2"
          lazy-validation
          ref="form"
          v-model="registerValid"
        >
          <v-text-field
            :rules="nameRules"
            label="Name"
            required
            v-model="inputtedName"
          />
          <v-text-field
            :rules="urlRules"
            label="URL"
            v-model="inputtedWorkflowUrl"
          />
          <div class="text-center info--text">OR</div>
          <v-file-input
            :rules="fileRules"
            clearable
            label="File"
            v-model="inputtedWorkflowFile"
          />
          <div class="d-flex justify-end pb-2">
            <v-btn
              :color="this.$colors.indigo.darken4"
              :disabled="!registerValid"
              @click="submitWorkflow"
              outlined
            >
              <v-icon class="mr-1">mdi-arrow-up</v-icon>Submit
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
    <v-snackbar
      :color="this.$colors.red.lighten1"
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
import { Workflow } from '@/store/workflow'
import { Service } from '@/store/service'
import { WorkflowTypeVersion } from '@/utils/types'
import moment from 'moment'

type ValidResult = boolean | string
type Rule = (value: string) => ValidResult

type DataObj = {
  workflowTableItemPerNum: number
  workflowHeaders: DataTableHeader[]
  selectedWorkflows: Workflow[]
  registerDialogShow: boolean
  registerValid: false
  inputtedName: string
  nameRules: Rule[]
  inputtedWorkflowUrl: string | undefined
  urlRules: Rule[]
  inputtedWorkflowFile: File | undefined
  fileRules: Rule[]
  errorSnackbar: boolean
}

type FormComponent = Vue & {
  validate: () => boolean
  reset: () => boolean
  resetValidation: () => boolean
}

type TypeVersion = {
  type: string
  version: string
}

type WorkflowType = {
  text: string
  value: TypeVersion
}

export default Vue.extend({
  props: {
    serviceId: String
  },
  data(): DataObj {
    return {
      workflowTableItemPerNum: 5,
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
          text: 'Date',
          value: 'date'
        }
      ],
      selectedWorkflows: [],
      registerDialogShow: false,
      registerValid: false,
      inputtedName: '',
      nameRules: [(v) => !!v || 'Name is required.'],
      inputtedWorkflowUrl: '',
      urlRules: [],
      inputtedWorkflowFile: undefined,
      fileRules: [],
      errorSnackbar: false
    }
  },
  computed: {
    service(): Service {
      return this.$store.state.service.services.filter(
        (service: Service) => service.uuid === this.serviceId
      )[0]
    },
    workflows(): Workflow[] {
      return this.$store.state.workflow.workflows
    },
    workflowNames(): string[] {
      return this.$store.getters['workflow/getWorkflowNames']
    }
  },
  methods: {
    openRegisterDialog(): void {
      this.registerDialogShow = true
    },
    async submitWorkflow(): Promise<void> {
      const validationResult = (this.$refs.form as FormComponent).validate()
      if (validationResult) {
        await this.$store
          .dispatch('workflow/submitWorkflow', {
            serviceId: this.serviceId,
            name: this.inputtedName,
            url: this.inputtedWorkflowUrl
          })
          .then((workflowId) => {
            ;(this.$refs.form as FormComponent).reset()
            // this.$router.push(`/service/${serviceId}`)
          })
          .catch((err) => {
            this.errorSnackbar = true
            console.error(err)
          })
      }
    },
    existName(name: string): boolean {
      return this.workflowNames.includes(name)
    },
    orUrlFile(): boolean {
      return !(
        (this.inputtedWorkflowUrl === '' &&
          typeof this.inputtedWorkflowFile === 'undefined') ||
        (this.inputtedWorkflowUrl !== '' &&
          typeof this.inputtedWorkflowFile !== 'undefined')
      )
    },
    validUrl(endpoint: string): boolean {
      let url
      try {
        url = new URL(endpoint)
      } catch (_) {
        return false
      }
      return url.protocol === 'http:' || url.protocol === 'https:'
    }
  },
  created() {
    this.nameRules.push(
      (v) => !this.existName(v) || `Name ${v} already exists.`
    )
    this.urlRules.push(
      (v) => this.orUrlFile() || 'Please enter either the URL or File'
    )
    this.urlRules.push(
      (v) => !v || this.validUrl(v) || `URL ${v} does not valid.`
    )
    this.fileRules.push(
      (v) => this.orUrlFile() || 'Please enter either the URL or File'
    )
  },
  watch: {
    inputtedWorkflowUrl() {
      ;(this.$refs.form as FormComponent).validate()
    },
    inputtedWorkflowFile() {
      ;(this.$refs.form as FormComponent).validate()
    }
  },
  filters: {
    formatDate(date: Date): string {
      return moment(date).format('YYYY-MM-DD hh:mm:ss')
    }
  }
})
</script>
