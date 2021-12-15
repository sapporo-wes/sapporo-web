<template>
  <img
    v-if="wfType === 'CWL'"
    src="~/assets/icon/cwl-icon.png"
    class="mt-2 mr-2"
    height="26"
  />
  <img
    v-else-if="wfType === 'WDL'"
    src="~/assets/icon/wdl-icon.png"
    class="mt-2 mr-2"
    height="26"
  />
  <img
    v-else-if="wfType.toLowerCase() === 'nextflow' || wfType === 'NFL'"
    src="~/assets/icon/nextflow-icon.png"
    class="mt-2 mr-2"
    height="26"
  />
  <img
    v-else-if="wfType.toLowerCase() === 'snakemake' || wfType === 'SMK'"
    src="~/assets/icon/snakemake-icon.png"
    class="mt-2 mr-2"
    height="26"
  />
  <v-icon v-else class="my-2 mr-2" v-text="'mdi-graph-outline'" />
</template>

<script>
export default {
  props: {
    wfType: {
      type: String,
      default: '',
    },
  },
}
</script>
