<template>
  <v-dialog
    :overlay-opacity="overlayOpacity"
    :value="dialogShow"
    :width="width"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header pl-6 pt-4" v-text="'Prepare Run'" />
      <run-form :service-id="serviceId" :workflow-id="workflowId" />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Rule, FormComponent } from '@/types'
import RunForm from '@/components/workflow/RunForm.vue'

export default Vue.extend({
  components: {
    RunForm
  },
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
      default: 800
    },
    serviceId: {
      type: String,
      required: true
    },
    workflowId: {
      type: String,
      required: true
    }
  }
})
</script>
