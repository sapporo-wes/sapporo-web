import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import colors from 'vuetify/lib/util/colors'

export default (_context: Context, inject: Inject): void => {
  inject('colors', colors)
}
