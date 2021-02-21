<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-btn
          color="error"
          outlined
          class="mb-4"
          @click.stop="clearState"
          v-text="'Clear State'"
        />
        <div
          :style="{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }"
          v-text="stateContent"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'

type Data = Record<string, unknown>

type Methods = {
  clearState: () => void
}

type Computed = {
  stateContent: string
}

type Props = Record<string, unknown>

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  computed: {
    stateContent() {
      return JSON.stringify(this.$store.state, null, 2)
    },
  },

  methods: {
    clearState() {
      this.$store.dispatch('services/clearServices')
      this.$store.dispatch('workflows/clearWorkflows')
      this.$store.dispatch('runs/clearRuns')
    },
  },
}

export default Vue.extend(options)
</script>
