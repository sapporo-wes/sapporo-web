import colors from 'vuetify/lib/util/colors'
import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'

export default (_context: Context, inject: Inject): void => {
  inject('colors', colors)
}
