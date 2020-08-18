import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { Service } from '@/types'
import { getServiceInfo } from '@/util/WESRequest'
import { v4 as uuidv4 } from 'uuid'

type State = {
  services: Service[]
}

export const state = (): State => ({
  services: []
})

export const getters: GetterTree<State, RootState> = {
  serviceNames(state: State): string[] {
    return state.services.map((service: Service) => service.name)
  },

  existName: (state: State) => (serviceName: string): boolean => {
    return state.services
      .map((service: Service) => service.name)
      .includes(serviceName)
  },

  serviceIds(state: State): string[] {
    return state.services.map((service: Service) => service.id)
  },

  serviceFilteredById: (state: State) => (serviceId: string): Service => {
    return state.services.filter(
      (service: Service) => service.id === serviceId
    )[0]
  },

  serviceFilteredByRunId: (state: State, getters, rootState, rootGetters) => (
    runId: string
  ): Service => {
    const run = rootGetters['run/runFilteredById'](runId)
    return getters.serviceFilteredById(run.serviceId)
  },

  workflowEngines: (state: State, getters, rootState, rootGetters) => (
    serviceId: string
  ): { name: string; version: string }[] => {
    const service: Service = getters.serviceFilteredById(serviceId)
    if (typeof service !== 'undefined') {
      return Object.entries(service.serviceInfo.workflow_engine_versions).map(
        ([name, version]: [string, string]) => ({
          name,
          version
        })
      )
    }

    return []
  }
}

export const mutations: MutationTree<State> = {
  clearServices(state: State): void {
    state.services = []
  },

  setServices(state: State, services: Service[]): void {
    state.services = services
  },

  addService(state: State, service: Service): void {
    state.services.push(service)
  }
}

export const actions: ActionTree<State, RootState> = {
  async clearServices({ commit }: ActionContext<State, any>) {
    commit('clearServices')
  },

  async submitService(
    { commit }: ActionContext<State, any>,
    service: { name: string; endpoint: string }
  ): Promise<string> {
    const serviceInfo = await getServiceInfo(
      this.$axios,
      service.endpoint
    ).catch((e) => {
      throw e
    })

    const serviceId: string = uuidv4()
    commit('addService', {
      name: service.name,
      endpoint: service.endpoint,
      state: 'Available',
      addedDate: new Date(),
      id: serviceId,
      workflowIds: [],
      serviceInfo
    })

    return serviceId
  },

  async deleteServices(
    { commit, state, dispatch }: ActionContext<State, any>,
    serviceIds: string[]
  ): Promise<void> {
    commit(
      'setServices',
      state.services.filter((service) => !serviceIds.includes(service.id))
    )
    await dispatch(
      'workflow/deleteWorkflows',
      state.services
        .filter((service) => serviceIds.includes(service.id))
        .map((service) => service.workflowIds)
        .flat(),
      { root: true }
    )
  }
}
