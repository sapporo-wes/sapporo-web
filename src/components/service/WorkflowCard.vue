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
    <div class="d-flex justify-end pb-6 pr-6">
      <v-btn
        :color="this.$colors.indigo.darken4"
        @click.stop="openRegisterDialog"
        class="mr-4"
        outlined
      >
        <v-icon class="mr-2">mdi-sticker-plus-outline</v-icon>Register
      </v-btn>
      <!-- :disabled="!this.selectedServices.length" -->
      <v-btn
        :color="this.$colors.red.darken4"
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
          <v-select
            :items="this.workflowTypes"
            :rules="[(v) => !!v || 'Please select.']"
            label="Type"
            required
            v-model="selectedWorkflowType"
          />
          <v-text-field
            :rules="nameRules"
            label="Name"
            required
            v-model="inputtedName"
          />
          <v-text-field
            :rules="urlRules"
            class="mt-8"
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
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Workflow } from '@/store/workflow'
import { Service } from '@/store/service'
import { WorkflowTypeVersion } from '@/utils/types'

type ValidResult = boolean | string
type Rule = (value: string) => ValidResult

type DataObj = {
  registerDialogShow: boolean
  registerValid: false
  selectedWorkflowType: string
  inputtedName: string
  nameRules: Rule[]
  inputtedWorkflowUrl: string | undefined
  urlRules: Rule[]
  inputtedWorkflowFile: File | undefined
  fileRules: Rule[]
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
      registerDialogShow: false,
      registerValid: false,
      selectedWorkflowType: '',
      inputtedName: '',
      nameRules: [(v) => !!v || 'Name is required.'],
      inputtedWorkflowUrl: '',
      urlRules: [],
      inputtedWorkflowFile: undefined,
      fileRules: []
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
    },
    workflowTypes(): WorkflowType[] {
      const workflowTypes = []
      for (const [type, versions] of Object.entries(
        this.service.workflowTypeVersions
      )) {
        for (const version of versions.workflow_type_version) {
          workflowTypes.push({
            text: `${type} ${version}`,
            value: {
              type: type,
              version: version
            }
          })
        }
      }
      return workflowTypes
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
          .dispatch('service/submitService', {
            name: this.inputtedName,
            endpoint: this.inputtedEndpoint
          })
          .then((serviceId) => {
            ;(this.$refs.form as FormComponent).reset()
            this.$router.push(`/service/${serviceId}`)
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
      return (
        (this.inputtedWorkflowUrl !== '' &&
          typeof this.inputtedWorkflowFile === 'undefined') ||
        (this.inputtedWorkflowUrl === '' &&
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
  }
})
</script>
