<template>
  <v-card
    :color="this.$colors.grey.lighten5"
    class="d-flex flex-column align-center"
    elevation="24"
    height="300"
    style="border-radius: 24px;"
    width="480"
  >
    <div class="mt-10">
      <span class="display-3 info--text">Sapporo</span>
    </div>
    <p class="text-center info--text mt-4">
      Web base management system for
      <a
        class="text-decoration-none"
        href="https://ga4gh.github.io/workflow-execution-service-schemas/"
        >GA4GH WES</a
      >
    </p>
    <p>
      <a class="text-decoration-none" href="https://github.com/ddbj/SAPPORO-web"
        >See more detail</a
      >
    </p>
    <git-hub-login-button class="mt-5" />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import GitHubLoginButton from '~/components/GitHubLoginButton.vue'

export default Vue.extend({
  components: {
    GitHubLoginButton
  }
})
</script>
