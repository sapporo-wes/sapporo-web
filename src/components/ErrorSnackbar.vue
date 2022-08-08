<template>
  <div class="text-center">
    <v-snackbar v-model="showModel" color="warning" multi-line text>
      {{ message }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" @click="$emit('close')"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true,
    },
    message: {
      type: String,
      default: '',
      required: true,
    },
  },

  data() {
    return {
      showModel: false,
    }
  },

  watch: {
    show() {
      this.showModel = this.show
    },
  },
})
</script>
