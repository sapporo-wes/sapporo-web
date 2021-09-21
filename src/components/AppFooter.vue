<template>
  <v-footer :color="$colors.indigo.darken1" absolute app height="24" padless>
    <div class="mx-auto my-auto">
      <span class="white--text" :style="{ fontSize: '12px' }">
        sapporo-web {{ version }} © Bioinformation and DDBJ Center
      </span>
    </div>
  </v-footer>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'

type Data = {
  version: string
}

type Methods = Record<string, never>

type Computed = Record<string, unknown>

type Props = Record<string, unknown>

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  data() {
    return {
      version: process.env.SAPPORO_WEB_VERSION || '',
    }
  },
}

export default Vue.extend(options)
</script>
