<template>
  <p
    class="info--text"
    :style="{
      fontSize: '1rem',
      paddingLeft: '60px'
    }"
  >
    <span
      :style="{
        color: this.$colors.red.darken4,
        textDecorationLine: 'underline'
      }"
      v-text="`NO ${this.content} are registered.`"
    />
    Click
    <span :style="{ color: this.$colors.indigo.darken4 }" v-text="'REGISTER'" />
    button.
  </p>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    content: {
      type: String,
      default: 'WES services',
      required: true
    }
  }
})
</script>
