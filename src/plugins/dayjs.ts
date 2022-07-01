import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import dayjs, { extend as dayjsExtend } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjsExtend(utc)
dayjsExtend(timezone)
dayjs.tz.setDefault(dayjs.tz.guess())

export default (_context: Context, inject: Inject): void => {
  inject('dayjs', dayjs)
}
