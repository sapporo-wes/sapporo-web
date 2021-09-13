import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(dayjs.tz.guess())

export default (_context: Context, inject: Inject): void => {
  inject('dayjs', dayjs)
}
