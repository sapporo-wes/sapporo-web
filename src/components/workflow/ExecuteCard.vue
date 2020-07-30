<template>
  <v-card elevation="8" max-width="960">
    <div class="card-header pl-6 pt-4">
      Execute Run
    </div>
    <v-card class="mx-12 mt-4" elevation="2">
      <v-card-title class="param-card-header" v-text="'Run Parameters'" />
      <v-form
        class="px-6 py-4"
        lazy-validation
        ref="runParamForm"
        v-model="runParamFormValid"
      >
        <div class="field-header" v-text="'Run Name'" />
        <v-text-field
          :rules="[(v) => !!v || 'Required.']"
          class="pt-0 px-4 pb-4"
          clearable
          hint="Required."
          persistent-hint
          single-line
          v-model="runName"
        />
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
        <v-textarea
          :rows="Number(1)"
          auto-grow
          class="pt-0 px-4 pb-4"
          clearable
          hint="Not required, JSON Object, Multiple lines."
          no-resize
          persistent-hint
          single-line
          v-model="wfEngineParams"
        />
        <div class="field-header" v-text="'Tags'" />
        <v-textarea
          :rows="Number(1)"
          auto-grow
          class="pt-0 px-4 pb-4"
          clearable
          hint="Not required, JSON Object, Multiple lines."
          no-resize
          persistent-hint
          single-line
          v-model="tags"
        />
      </v-form>
    </v-card>
    <v-card class="mx-12 my-6" elevation="2">
      <v-card-title class="param-card-header" v-text="'Workflow Parameters'" />
      <v-form
        class="px-6 py-4"
        lazy-validation
        ref="workflowParamForm"
        v-model="workflowParamFormValid"
      >
        <div v-for="param of workflow.params" :key="param.name">
          <div class="field-header" v-text="param.name" />
          <v-switch
            :hint="hintSentenses[param.name]"
            class="pt-0 px-4 pb-4"
            persistent-hint
            v-if="param.type === 'boolean'"
            v-model="inputtedValues[param.name]"
          />
          <v-text-field
            :hint="hintSentenses[param.name]"
            :rules="[(v) => !!v || param.optional || hintSentenses[param.name]]"
            :type="'number'"
            class="pt-0 px-4 pb-4"
            clearable
            persistent-hint
            single-line
            v-if="param.type === 'int'"
            v-model="inputtedValues[param.name]"
          />
          <v-text-field
            :hint="hintSentenses[param.name]"
            :rules="[(v) => !!v || param.optional || hintSentenses[param.name]]"
            class="pt-0 px-4 pb-4"
            clearable
            persistent-hint
            single-line
            v-if="param.type === 'string'"
            v-model="inputtedValues[param.name]"
          />
          <v-text-field
            :hint="hintSentenses[param.name]"
            :rules="[(v) => !!v || param.optional || hintSentenses[param.name]]"
            class="pt-0 px-4 pb-4"
            clearable
            label="URL"
            persistent-hint
            single-line
            v-if="param.type === 'file'"
            v-model="inputtedValues[param.name]"
          />
        </div>
      </v-form>
    </v-card>
    <div class="d-flex justify-end pb-6 mr-12">
      <v-btn
        :color="$colors.indigo.darken4"
        @click="executeRun"
        outlined
        :disabled="!runParamFormValid || !workflowParamFormValid"
      >
        <v-icon class="mr-2">mdi-rocket-launch-outline</v-icon>Execute
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Workflow, Service, Rule, FormComponent } from '@/types'
import moment from 'moment'

type dataObj = {
  runParamFormValid: boolean
  workflowParamFormValid: boolean
  runName: string
  workflowEngine: string
  wfEngineParams: string
  tags: string
  inputtedValues: { [key: string]: any }
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
      runParamFormValid: false,
      workflowParamFormValid: false,
      runName: '',
      workflowEngine: '',
      wfEngineParams: '{}',
      tags: '{}',
      inputtedValues: {}
    }
  },
  created() {
    for (let param of this.workflow.params) {
      this.$set(this.inputtedValues, param.name, param.default)
    }
    this.runName = `${this.workflow.name} ${moment(new Date()).format(
      'YYYY-MM-DD hh:mm:ss'
    )}`
  },
  computed: {
    service(): Service {
      return this.$store.getters['service/serviceFilteredById'](this.serviceId)
    },
    workflow(): Workflow {
      return this.$store.getters['workflow/workflowFilteredById'](
        this.workflowId
      )
    },
    workflowEngines(): string[] {
      return this.$store.getters['service/workflowEngines'](
        this.service.id
      ).map(
        (wfEngine: { name: string; version: string }) =>
          `${wfEngine.name} ${wfEngine.version}`
      )
    },
    hintSentenses(): { [key: string]: string } {
      const hintSentenses: { [key: string]: string } = {}
      for (let param of this.workflow.params) {
        const hints = []
        if (param.type !== 'boolean') {
          if (param.required) {
            hints.push('Required')
          } else {
            hints.push('Not required')
          }
        }
        hints.push(param.type.charAt(0).toUpperCase() + param.type.slice(1))
        if (param.additionalInfo?.secondaryFiles) {
          hints.push(`secondaryFiles: [${param.additionalInfo.secondaryFiles}]`)
        }
        hintSentenses[param.name] = `${hints.join(', ')}.`
      }
      return hintSentenses
    }
  },
  methods: {
    async executeRun(): Promise<void> {
      const runParamValidationResult = (this.$refs
        .runParamForm as FormComponent).validate()
      const workflowParamValidationResult = (this.$refs
        .workflowParamForm as FormComponent).validate()
      if (runParamValidationResult && workflowParamValidationResult) {
        const wfEngineName = this.workflowEngine.split(' ')[0]
        const wfEngineParams = !!this.wfEngineParams
          ? this.wfEngineParams
          : '{}'
        const tags = !!this.tags ? this.tags : '{}'
        await this.$store
          .dispatch('run/executeRun', {
            service: this.service,
            workflow: this.workflow,
            runName: this.runName,
            inputtedValues: this.inputtedValues,
            tags,
            wfEngineName,
            wfEngineParams
          })
          .then((runId) => {
            console.log(runId)
            // this.$router.push(`/service/${this.serviceId}/${runId}`)
          })
          .catch((err) => {
            // Error dialog
            console.error(err)
          })
      }
    }
  }
})
</script>

<style scoped>
.param-card-header {
  font-family: 'Quicksand', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  background: #eeeeee;
}

.field-header {
  font-size: 1.1rem;
  font-weight: 400;
}
</style>
