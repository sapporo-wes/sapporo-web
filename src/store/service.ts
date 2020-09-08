import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { Service } from '@/types'
import { getServiceInfo } from '@/util/WESRequest'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'

type State = {
  services: { [id: string]: Service }
}

export const state = (): State => ({
  services: {}
})

export const getters: GetterTree<State, RootState> = {
  servicesList(state: State): Service[] {
    return Object.values(state.services)
  },

  serviceIds(state: State): string[] {
    return Object.keys(state.services)
  },

  serviceNames(state: State, getters): string[] {
    return getters.servicesList.map((service: Service) => service.name)
  },

  existId: (state: State, getters) => (serviceId: string): boolean => {
    return getters.serviceIds.includes(serviceId)
  },

  existName: (state: State, getters) => (serviceName: string): boolean => {
    return getters.serviceNames.includes(serviceName)
  },

  idToName: (state: State) => (serviceId: string): string => {
    return state.services[serviceId]?.name
  },

  serviceFilteredById: (state: State) => (serviceId: string): Service => {
    return state.services[serviceId]
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
    Vue.set(state, 'services', {})
  },

  deleteService(state: State, serviceId: string): void {
    Vue.delete(state.services, serviceId)
  },

  setServices(state: State, services: { [id: string]: Service }): void {
    Vue.set(state, 'services', services)
  },

  addService(
    state: State,
    payload: { serviceId: string; service: Service }
  ): void {
    Vue.set(state.services, payload.serviceId, payload.service)
  },

  setServiceState(state: State, payload: { serviceId: string; state: string }) {
    Vue.set(state.services[payload.serviceId], 'state', payload.state)
  },

  setWorkflowIds(
    state: State,
    payload: { serviceId: string; workflowIds: string[] }
  ) {
    Vue.set(
      state.services[payload.serviceId],
      'workflowIds',
      payload.workflowIds
    )
  },

  setRunIds(state: State, payload: { serviceId: string; runIds: string[] }) {
    Vue.set(state.services[payload.serviceId], 'runIds', payload.runIds)
  },

  addRunId(state: State, payload: { serviceId: string; runId: string }) {
    state.services[payload.serviceId].runIds.push(payload.runId)
  },

  addWorkflowId(
    state: State,
    payload: { serviceId: string; workflowId: string }
  ) {
    state.services[payload.serviceId].workflowIds.push(payload.workflowId)
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
      serviceId,
      service: {
        name: service.name,
        endpoint: service.endpoint,
        state: 'Available',
        addedDate: new Date(),
        id: serviceId,
        workflowIds: [],
        runIds: [],
        serviceInfo
      }
    })

    return serviceId
  },

  async deleteServices(
    { commit, state, dispatch }: ActionContext<State, any>,
    serviceIds: string[]
  ): Promise<void> {
    const workflowIds = serviceIds.flatMap(
      (serviceId: string) => state.services[serviceId].workflowIds
    )
    const runIds = serviceIds.flatMap(
      (serviceId: string) => state.services[serviceId].runIds
    )
    serviceIds.forEach((serviceId: string) =>
      commit('deleteService', serviceId)
    )
    await dispatch('workflow/deleteWorkflows', workflowIds, {
      root: true
    })
  },

  async updateServiceState(
    { commit, getters }: ActionContext<State, any>,
    serviceId: string
  ): Promise<void> {
    const service = getters.serviceFilteredById(serviceId)
    const _ = await getServiceInfo(this.$axios, service.endpoint).catch((e) => {
      commit('setServiceState', { serviceId, state: 'Disconnect' })
      return
    })
    commit('setServiceState', { serviceId, state: 'Available' })
  },

  async updateAllServicesState({
    getters,
    dispatch
  }: ActionContext<State, any>): Promise<void> {
    const queue = []
    for (const service of getters.servicesList) {
      queue.push(dispatch('updateServiceState', service.id))
    }
    await Promise.all(queue)
  },

  async addWorkflowId(
    { commit }: ActionContext<State, any>,
    payload: { serviceId: string; workflowId: string }
  ): Promise<void> {
    commit('addWorkflowId', payload)
  },

  async removeWorkflowIdFromWorkflowIds(
    { commit, state }: ActionContext<State, any>,
    payload: { serviceId: string; workflowId: string }
  ) {
    const workflowIds = state.services[payload.serviceId].workflowIds.filter(
      (workflowId: string) => {
        workflowId !== payload.workflowId
      }
    )
    commit('setWorkflowIds', {
      serviceId: payload.serviceId,
      workflowIds
    })
  },

  async addRunId(
    { commit }: ActionContext<State, any>,
    payload: { serviceId: string; runId: string }
  ): Promise<void> {
    commit('addRunId', payload)
  },

  async removeRunIdFromRunIds(
    { commit, state }: ActionContext<State, any>,
    payload: { serviceId: string; runId: string }
  ) {
    const runIds = state.services[payload.serviceId].runIds.filter(
      (runId: string) => {
        runId !== payload.runId
      }
    )
    commit('setRunIds', { serviceId: payload.serviceId, runIds })
  }
}
