<template>
  <div>{{ this.run }}</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Run } from '@/types'

export default Vue.extend({
  computed: {
    runId(): string {
      return this.$route.params.runId
    },
    run(): Run {
      return this.$store.getters['run/runFilteredById'](this.runId)
    }
  }
})
</script>

<style></style>
