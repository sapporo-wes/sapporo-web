<template>
  <v-app>
    <app-bar />
    <v-main class="background">
      <v-container fluid>
        <template v-if="this.existRunId">
          <info-card :run-id="this.runId" class="mt-4 mx-auto" />
          <log-card :run-id="this.runId" class="mt-8 mx-auto mb-4" />
        </template>
        <template v-else>Does not exist.</template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { ComponentOptions } from 'vue/types'
import AppBar from '@/components/AppBar.vue'
import InfoCard from '@/components/run/InfoCard.vue'
import LogCard from '@/components/run/LogCard.vue'
import { MyWindow } from '@/plugins/localStorage'

export default Vue.extend({
  components: {
    AppBar,
    InfoCard,
    LogCard
  },
  async middleware({ store, route }) {
    ;((window as unknown) as MyWindow).onNuxtReady(async () => {
      await store.dispatch('run/updateRun', route.params.runId)
    })
  },
  computed: {
    existRunId(): boolean {
      return this.$store.getters['run/existId'](this.runId)
    },
    runId(): string {
      return this.$route.params.runId
    }
  }
})
</script>
