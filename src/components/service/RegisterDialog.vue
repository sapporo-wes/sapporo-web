<template>
  <v-dialog
    :overlay-opacity="overlayOpacity"
    :value="dialogShow"
    :width="width"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header pl-6 pt-4" v-text="'Register Workflow'" />
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
        <div class="text-center info--text" v-text="'OR'" />
        <v-file-input
          :rules="fileRules"
          clearable
          label="File"
          v-model="inputtedWorkflowFile"
        />
      </v-form>
      <div class="d-flex justify-end px-12 pb-6">
        <v-btn
          :color="this.$colors.indigo.darken4"
          :disabled="!registerValid"
          @click="submitWorkflow"
          outlined
        >
          <v-icon class="mr-1">mdi-arrow-up</v-icon>Submit
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Rule, FormComponent } from '@/types'

type dataObj = {
  registerValid: boolean
  inputtedName: string
  nameRules: Rule[]
  inputtedWorkflowUrl: string | undefined
  urlRules: Rule[]
  inputtedWorkflowFile: File | undefined
  fileRules: Rule[]
}

export default Vue.extend({
  props: {
    overlayOpacity: {
      type: Number,
      default: 0.8
    },
    dialogShow: {
      type: Boolean,
      default: false,
      required: true
    },
    width: {
      type: Number,
      default: 600
    },
    serviceId: {
      type: String,
      required: true
    }
  },
  data(): dataObj {
    return {
      registerValid: false,
      inputtedName: '',
      inputtedWorkflowUrl: '',
      inputtedWorkflowFile: undefined,
      nameRules: [(v) => !!v || 'Name is required.'],
      urlRules: [],
      fileRules: []
    }
  },
  watch: {
    inputtedWorkflowUrl() {
      ;(this.$refs.form as FormComponent).validate()
    },
    inputtedWorkflowFile() {
      ;(this.$refs.form as FormComponent).validate()
    }
  },
  created() {
    this.nameRules.push(
      (v) =>
        !this.$store.getters['workflow/existName'](v) ||
        `Name ${v} already exists.`
    )
    this.urlRules.push(
      (v) => this.orUrlFile() || 'Please enter either the URL or File'
    )
    this.urlRules.push((v) => !v || validUrl(v) || `URL ${v} does not valid.`)
    this.fileRules.push(
      (v) => this.orUrlFile() || 'Please enter either the URL or File'
    )
  },
  methods: {
    orUrlFile(): boolean {
      return !(
        (this.inputtedWorkflowUrl === '' &&
          typeof this.inputtedWorkflowFile === 'undefined') ||
        (this.inputtedWorkflowUrl !== '' &&
          typeof this.inputtedWorkflowFile !== 'undefined')
      )
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
            // this.$router.push(`/workflow/${workflowId}`)
          })
          .catch((err) => {
            ;(this.$refs.form as FormComponent).reset()
            ;(this.$refs.form as FormComponent).resetValidation()
            this.$emit('error')
            this.$emit('close')
            console.error(err)
          })
      }
    }
  }
})

const validUrl = (val: string): boolean => {
  let url
  try {
    url = new URL(val)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}
</script>
