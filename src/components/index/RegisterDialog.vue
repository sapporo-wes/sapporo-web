<template>
  <v-dialog
    :overlay-opacity="overlayOpacity"
    :value="dialogShow"
    :width="width"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header pl-6 pt-4" v-text="'Register Service'" />
      <v-form
        class="px-12 pt-2"
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
          :rules="endpointRules"
          label="Endpoint"
          required
          v-model="inputtedEndpoint"
        />
      </v-form>
      <div class="d-flex justify-end px-12 pb-6">
        <v-btn
          :color="$colors.indigo.darken4"
          :disabled="!registerValid"
          @click="submitService"
          outlined
        >
          <v-icon class="mr-2">mdi-arrow-up</v-icon>Submit
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { FormComponent, Rule } from '@/types'

type dataObj = {
  registerValid: boolean
  inputtedName: string
  inputtedEndpoint: string
  nameRules: Rule[]
  endpointRules: Rule[]
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
    }
  },
  data(): dataObj {
    return {
      registerValid: false,
      inputtedName: '',
      inputtedEndpoint: '',
      nameRules: [(v) => !!v || 'Name is required.'],
      endpointRules: [(v) => !!v || 'Endpoint is required.']
    }
  },
  created() {
    this.nameRules.push(
      (v) =>
        !this.$store.getters['service/existName'](v) ||
        `Name ${v} already exists.`
    )
    this.endpointRules.push(
      (v) => validEndpoint(v) || `Endpoint ${v} does not valid.`
    )
  },
  methods: {
    async submitService(): Promise<void> {
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

const validEndpoint = (val: string): boolean => {
  let url
  try {
    url = new URL(val)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}
</script>
