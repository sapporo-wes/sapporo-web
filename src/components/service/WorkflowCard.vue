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
        @click="void 0"
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
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Workflow } from '@/store/workflow'

export default Vue.extend({
  computed: {
    workflows(): Workflow[] {
      return this.$store.state.workflow.workflows
    }
  },
  methods: {
    openDeleteDialog(): void {
      alert('Open delete dialog')
    }
  }
})
</script>
