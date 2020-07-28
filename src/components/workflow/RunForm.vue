<template>
  <div>
    <v-expansion-panels
      focusable
      multiple
      class="px-8 pt-2"
      v-model="expandPanels"
    >
      <v-expansion-panel>
        <v-expansion-panel-header>Run Parameters</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-form
            class="px-2 pt-4"
            lazy-validation
            ref="runParamForm"
            v-model="runParamFormValid"
          >
            <div class="field-header" v-text="'Workflow Engine'" />
            <v-select
              :items="workflowEngines"
              :rules="[(v) => !!v || 'Required.']"
              class="pt-0 px-4 pb-4"
              clearable
              hint="Required."
              persistent-hint
              single-line
              v-model="workflowEngine"
            />
            <div class="field-header" v-text="'Workflow Engine Parameters'" />
            <v-text-field
              class="pt-0 px-4 pb-4"
              clearable
              hint="No required, String."
              persistent-hint
              single-line
              v-model="workflowEngineParameters"
            />
            <div class="field-header" v-text="'Tags'" />
            <v-textarea
              :rows="Number(1)"
              auto-grow
              class="pt-0 px-4 pb-4"
              clearable
              hint="No required, JSON Object, Multiple lines."
              no-resize
              persistent-hint
              single-line
              v-model="tags"
            />
            <div class="field-header" v-text="'Workflow Attachments'" />
            <v-file-input
              chips
              class="pt-0 px-4 pb-4"
              clearable
              hint="No required, Multiple Files."
              multiple
              persistent-hint
              show-size
              single-line
              v-model="workflowAttachments"
            />
          </v-form>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>Workflow Parameters</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-form
            class="px-2 pt-4"
            lazy-validation
            ref="workflowParamForm"
            v-model="workflowParamFormValid"
          >
            <div v-for="param of workflow.params" :key="param.name">
              <div class="field-header" v-text="param.name" />
              <v-switch
                :hint="hintSentenses[param.name]"
                :rules="[(v) => (!!v && !param.required) || 'Required.']"
                class="pt-0 px-4 pb-4"
                persistent-hint
                v-if="param.type === 'boolean'"
                v-model="workflowValues[param.name]"
              />
              <v-text-field
                :hint="hintSentenses[param.name]"
                :rules="[(v) => (!!v && !param.required) || 'Required.']"
                :type="'number'"
                class="pt-0 px-4 pb-4"
                clearable
                persistent-hint
                single-line
                v-if="param.type === 'int' || param.type === 'float'"
                v-model="workflowValues[param.name]"
              />
              <v-text-field
                :hint="hintSentenses[param.name]"
                :rules="[(v) => (!!v && !param.required) || 'Required.']"
                class="pt-0 px-4 pb-4"
                clearable
                persistent-hint
                single-line
                v-if="param.type === 'string'"
                v-model="workflowValues[param.name]"
              />
              <div v-if="param.type === 'File'">
                <v-text-field
                  :hint="hintSentenses[param.name]"
                  :rules="[(v) => (!!v && !param.required) || 'Required.']"
                  class="pt-0 px-4"
                  clearable
                  label="URL"
                  persistent-hint
                  single-line
                  v-model="workflowValues[param.name].string"
                />
                <div class="text-center info--text" v-text="'OR'" />
                <v-file-input
                  :hint="hintSentenses[param.name]"
                  :rules="[(v) => (!!v && !param.required) || 'Required.']"
                  chips
                  class="pt-0 px-4 pb-4"
                  clearable
                  persistent-hint
                  show-size
                  single-line
                  v-if="param.type === 'File'"
                  v-model="workflowValues[param.name].file"
                />
              </div>
              <v-file-input
                :hint="hintSentenses[param.name]"
                :rules="[(v) => (!!v && !param.required) || 'Required.']"
                chips
                class="pt-0 px-4 pb-4"
                clearable
                multiple
                persistent-hint
                show-size
                single-line
                v-if="param.type === 'Directory'"
                v-model="workflowValues[param.name]"
                webkitdirectory
              />
            </div>
          </v-form>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <div class="d-flex justify-end px-12 py-6">
      <v-btn
        :color="this.$colors.indigo.darken4"
        :disabled="!runParamFormValid"
        @click="submitRun"
        outlined
      >
        <v-icon class="mr-1">mdi-arrow-up</v-icon>Submit
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Workflow, Service, WorkflowEngine, Rule, FormComponent } from '@/types'

type dataObj = {
  expandPanels: number[]
  runParamFormValid: boolean
  workflowParamFormValid: boolean
  workflowEngine: string
  workflowEngineParameters: string
  tags: string
  workflowAttachments: File[]
  workflowValues: { [s: string]: any }
}

export default Vue.extend({
  props: {
    serviceId: {
      type: String,
      required: true
    },
    workflowId: {
      type: String,
      required: true
    }
  },
  data(): dataObj {
    return {
      expandPanels: [0, 1],
      runParamFormValid: false,
      workflowParamFormValid: false,
      workflowEngine: '',
      workflowEngineParameters: '{}',
      tags: '{}',
      workflowAttachments: [],
      workflowValues: {}
    }
  },
  created() {
    for (let param of this.workflow.params) {
      if (param.type === 'File') {
        this.workflowValues[param.name] = {}
        this.$set(this.workflowValues[param.name], 'file', null)
        this.$set(this.workflowValues[param.name], 'string', null)
      } else {
        this.$set(this.workflowValues, param.name, param.default)
      }
    }
  },
  computed: {
    service(): Service {
      return this.$store.getters['service/serviceFilterId'](this.serviceId)
    },
    workflow(): Workflow {
      return this.$store.getters['workflow/workflowFilterId'](this.workflowId)
    },
    workflowEngines(): string[] {
      return this.$store.getters['service/workflowEngines'](
        this.service.uuid
      ).map(
        (wfEngine: WorkflowEngine) => `${wfEngine.name} ${wfEngine.version}`
      )
    },
    hintSentenses(): { [key: string]: string } {
      const hintSentenses: { [key: string]: string } = {}
      for (let param of this.workflow.params) {
        const values = []
        if (param.optional) {
          values.push('No required')
        }
        values.push(param.type.charAt(0).toUpperCase() + param.type.slice(1))
        if (param.other.secondaryFiles) {
          values.push(`secondaryFiles: [${param.other.secondaryFiles}]`)
        }
        hintSentenses[param.name] = `${values.join(', ')}.`
      }
      return hintSentenses
    }
  },
  methods: {
    async submitRun(): Promise<void> {
      const runParamValidationResult = (this.$refs
        .runParamForm as FormComponent).validate()
      const workflowParamValidationResult = (this.$refs
        .workflowParamForm as FormComponent).validate()
      if (runParamValidationResult && workflowParamValidationResult) {
        //   await this.$store
        //     .dispatch('workflow/submitWorkflow', {
        //       serviceId: this.serviceId,
        //       name: this.inputtedName,
        //       url: this.inputtedWorkflowUrl,
        //       file: this.inputtedWorkflowFile
        //     })
        //     .then((workflowId) => {
        //       ;(this.$refs.form as FormComponent).reset()
        //       this.$router.push(`/workflow/${workflowId}`)
        //     })
        //     .catch((err) => {
        //       ;(this.$refs.form as FormComponent).reset()
        //       ;(this.$refs.form as FormComponent).resetValidation()
        //       this.$emit('error')
        //       this.$emit('close')
        //       console.error(err)
        //     })
      }
    }
  }
})
</script>

<style scoped>
.v-expansion-panel-header {
  color: #424242;
  font-family: 'Quicksand', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
}

.field-header {
  color: #424242;
  font-size: 1.1rem;
  font-weight: 400;
}
</style>
