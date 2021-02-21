/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue from 'vue'
import { Colors } from 'vuetify/es5/util/colors'

declare module 'vue/types/vue' {
  interface Vue {
    $colors: Colors
  }
}
