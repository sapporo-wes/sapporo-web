<template>
  <img
    v-if="wfType === 'CWL'"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
    src="~/assets/icon/cwl-icon.png"
  />
  <img
    v-else-if="wfType === 'WDL'"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
    src="~/assets/icon/wdl-icon.png"
  />
  <img
    v-else-if="wfType.toLowerCase() === 'nextflow' || wfType === 'NFL'"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
    src="~/assets/icon/nextflow-icon.png"
  />
  <img
    v-else-if="wfType.toLowerCase() === 'snakemake' || wfType === 'SMK'"
    :class="{ 'mt-2': topMargin, 'mr-2': true }"
    :height="size"
    src="~/assets/icon/snakemake-icon.png"
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
