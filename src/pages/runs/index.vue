<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <breadcrumbs-header />
        <template v-if="existRunId">
          <info-card class="mx-auto" :run-id="runId" />
          <log-card class="mt-8 mx-auto mb-4" :run-id="runId" />
        </template>
        <template v-else>{{ `Run id: ${runId} does not exist.` }}</template>
      </v-container>
    </v-main>
    <app-footer />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MyWindow } from '@/plugins/localStorage'
import { Run } from '@/store/runs'
import AppBar from '@/components/AppBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import BreadcrumbsHeader from '@/components/BreadcrumbsHeader.vue'
import InfoCard from '@/components/runs/InfoCard.vue'
import LogCard from '@/components/runs/LogCard.vue'

export default defineComponent({
  components: {
    AppBar,
    AppFooter,
    BreadcrumbsHeader,
    InfoCard,
    LogCard,
  },

  middleware({ store, route }) {
    let runId = route.query.runId || ''
    if (Array.isArray(runId)) {
      runId = runId[0] || ''
    }
    ;(window as unknown as MyWindow).onNuxtReady(() => {
      store.dispatch('runs/updateRun', runId)
    })
  },

  computed: {
    runId(): string {
      const runId = this.$route.query.runId || ''
      if (Array.isArray(runId)) {
        return runId[0] || ''
      } else {
        return runId
      }
    },

    existRunId(): boolean {
      return this.$store.getters['runs/runIds'].includes(this.runId)
    },

    run(): Run {
      return this.$store.getters['runs/run'](this.runId)
    },
  },

  created() {
    setInterval(() => {
      // eslint-disable-next-line nuxt/no-globals-in-created
      if (document.visibilityState === 'visible') {
        if (
          [
            'UNKNOWN',
            'QUEUED',
            'INITIALIZING',
            'RUNNING',
            'CANCELING',
          ].includes(this.$store.getters['runs/run'](this.runId))
        ) {
          this.$store.dispatch('runs/updateRun', this.runId)
        }
      }
    }, 5000)
  },
})
</script>
