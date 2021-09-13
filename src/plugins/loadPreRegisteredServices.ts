import { Context } from '@nuxt/types'
import preRegisteredServices from '@/assets/preRegisteredServices.json'
import { Service } from '@/store/services'

export interface MyWindow extends Window {
  onNuxtReady(obj: () => void): void
}
declare let window: MyWindow

export default (context: Context): void => {
  window.onNuxtReady(async () => {
    if (context.env?.LOAD_PRE_REGISTERED_SERVICES === "'true'") {
      const services: Service[] = context.store.getters['services/services']
      const serviceNames = services.map((service) => service.name)
      for (const preRegisteredService of preRegisteredServices) {
        if (!serviceNames.includes(preRegisteredService.name)) {
          await context.store.dispatch('services/submitService', {
            name: preRegisteredService.name,
            endpoint: preRegisteredService.endpoint,
            preRegistered: true,
          })
        }
      }
    }
  })
}
