<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs />
        <template v-if="existRunId">
          <info-card :run-id="runId" class="mx-auto" />
          <log-card :run-id="runId" class="mt-8 mx-auto mb-4" />
        </template>
        <template v-else>{{ `Run id: ${runId} does not exist.` }}</template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { MyWindow } from '@/plugins/localStorage'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import AppBar from '@/components/AppBar.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import InfoCard from '@/components/runs/InfoCard.vue'
import LogCard from '@/components/runs/LogCard.vue'
import Vue from 'vue'

type Data = Record<string, unknown>

type Methods = Record<string, unknown>

type Computed = {
  runId: string
  existRunId: boolean
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
    Breadcrumbs,
    InfoCard,
    LogCard,
  },

  middleware({ store, route }) {
    let runId = route.query.runId || ''
    if (Array.isArray(runId)) {
      runId = runId[0] || ''
    }
    ;((window as unknown) as MyWindow).onNuxtReady(async () => {
      await store.dispatch('runs/updateRun', runId)
    })
  },

  computed: {
    runId() {
      const runId = this.$route.query.runId || ''
      if (Array.isArray(runId)) {
        return runId[0] || ''
      } else {
        return runId
      }
    },

    existRunId(): boolean {
      return this.$store.getters['runs/existId'](this.runId)
    },
  },
}

export default Vue.extend(options)
</script>