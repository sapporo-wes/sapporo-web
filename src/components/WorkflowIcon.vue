<template>
  <img
    v-if="wfType === 'CWL'"
    src="~/assets/icon/cwl-icon.png"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
  />
  <img
    v-else-if="wfType === 'WDL'"
    src="~/assets/icon/wdl-icon.png"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
  />
  <img
    v-else-if="wfType.toLowerCase() === 'nextflow' || wfType === 'NFL'"
    src="~/assets/icon/nextflow-icon.png"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
  />
  <img
    v-else-if="wfType.toLowerCase() === 'snakemake' || wfType === 'SMK'"
    src="~/assets/icon/snakemake-icon.png"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
  />
  <v-icon v-else class="my-2 mr-2" v-text="'mdi-graph-outline'" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    wfType: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 26,
    },

    topMargin: {
      type: Boolean,
      default: true,
    },
  },
})
</script>
