<template>
  <v-footer absolute app :color="$colors.indigo.darken1" height="24" padless>
    <div class="mx-auto my-auto">
      <span class="white--text" :style="{ fontSize: '12px' }">
        sapporo-web {{ version }} © DDBJ (Bioinformatics and DDBJ Center)
      </span>
    </div>
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      version: process.env.SAPPORO_WEB_VERSION || '',
    }
  },
})
</script>
