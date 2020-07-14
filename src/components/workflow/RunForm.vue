<template>
  <v-form class="px-12 py-2" lazy-validation ref="form" v-model="formValid">
    {{ workflow.params }}
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'
import { Workflow, Service } from '@/types'

type dataObj = {
  formValid: boolean
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
      formValid: false
    }
  },
  computed: {
    service(): Service {
      return this.$store.getters['service/serviceFilterId'](this.serviceId)
    },
    workflow(): Workflow {
      return this.$store.getters['workflow/workflowFilterId'](this.workflowId)
    }
  }
})
</script>
