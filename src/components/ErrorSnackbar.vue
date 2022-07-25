<template>
  <v-snackbar
    centered
    color="red accent-4"
    multi-line
    outlined
    rounded
    :style="{
      zIndex: '9999',
    }"
    text
    :timeout="-1"
    :value="visible"
  >
    <div>
      <v-icon>error</v-icon>
      <br />
      <span>
        {{ message }}
      </span>
    </div>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    close: {
      type: Function,
      default: () => {},
    },
    message: {
      type: String,
      default: '',
    },
  },
})
</script>
