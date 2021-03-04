<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <v-card elevation="8" max-width="1200" class="mx-auto">
          <div class="d-flex flex-column px-6 py-4">
            <div class="d-flex mb-4">
              <v-btn
                color="error"
                outlined
                @click.stop="clearState"
                v-text="'Clear State'"
              />
              <v-btn
                color="error"
                outlined
                class="ml-4"
                @click.stop="forceClearState"
                v-text="'Force Clear State'"
              />
            </div>
            <div
              :style="{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }"
              v-text="stateContent"
            />
          </div>
        </v-card>
      </v-container>
    </v-main>
    <app-footer />
  </v-app>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import Vue from 'vue'

type Data = Record<string, unknown>

type Methods = {
  clearState: () => void
  forceClearState: () => void
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
  components: {
    AppBar,
    AppFooter,
  },

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

    forceClearState() {
      this.$store.dispatch('services/clearServices', { force: true })
      this.$store.dispatch('workflows/clearWorkflows', { force: true })
      this.$store.dispatch('runs/clearRuns')
    },
  },
}

export default Vue.extend(options)
</script>
