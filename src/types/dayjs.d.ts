/* eslint-disable @typescript-eslint/no-unused-vars */
import dayjs from 'dayjs'
import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $dayjs: typeof dayjs
  }
}
