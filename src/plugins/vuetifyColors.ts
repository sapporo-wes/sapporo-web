import colors from 'vuetify/lib/util/colors'
import { Colors } from 'vuetify/lib/util/colors'

declare module 'vue/types/vue' {
  interface Vue {
    $colors: Colors
  }
}

export default ({}, inject: any) => {
  inject('colors', colors)
}
