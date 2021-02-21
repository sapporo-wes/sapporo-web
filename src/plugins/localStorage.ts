import SecureLS from 'secure-ls'
import createPersistedState from 'vuex-persistedstate'

import { Context, Plugin } from '@nuxt/types'

const ls = new SecureLS({ isCompression: false })

export interface MyWindow extends Window {
  onNuxtReady(obj: () => void): void
}
declare let window: MyWindow

const localStorage: Plugin = (ctx: Context) => {
  window.onNuxtReady(() => {
    createPersistedState({
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    })(ctx.store)
  })
}

export default localStorage
