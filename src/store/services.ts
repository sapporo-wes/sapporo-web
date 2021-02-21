import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import colors from 'vuetify/lib/util/colors'
import { ActionTree, GetterTree, MutationTree } from 'vuex'

import { RootState } from '@/store'
import { Run } from '@/store/runs'
import { Workflow } from '@/store/workflows'
import { ServiceInfo, WorkflowTypeVersion } from '@/types/WES'
import { getServiceInfo } from '@/utils/WESRequest'

export type Service = {
  name: string
  endpoint: string
  state: 'Available' | 'Disconnect' | 'Unknown'
  addedDate: Date
  id: string
  workflowIds: string[]
  runIds: string[]
  serviceInfo: ServiceInfo
  registeredOnlyMode: boolean
  getRuns: boolean
  workflowAttachment: boolean
}

export type State = { [id: string]: Service }

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {
  service: (state) => (serviceId: string): Service | undefined => {
    return state[serviceId]
  },

  services(state): Service[] {
    return Object.values(state)
  },

  serviceIds(state): string[] {
    return Object.keys(state)
  },

  serviceNames(_state, getters): string[] {
    return getters.services.map((service: Service) => service.name)
  },

  existId: (_state, getters) => (serviceId: string): boolean => {
    return getters.serviceIds.includes(serviceId)
  },

  existName: (_state, getters) => (serviceName: string): boolean => {
    return getters.serviceNames.includes(serviceName)
  },

  stateColor: (_state, getters) => (serviceId: string): string => {
    const service: Service | undefined = getters.service(serviceId)
    if (typeof service !== 'undefined') {
      const serviceState = service?.state
      if (serviceState === 'Available') return colors.green.darken1
      else if (serviceState === 'Disconnect') return colors.red.darken1
      else if (serviceState === 'Unknown') return colors.grey.darken1
    }
    return colors.grey.darken1
  },

  serviceFilteredByWorkflowId: (_state, getters, _rootState, rootGetters) => (
    workflowId: string
  ): Service | undefined => {
    const workflow: Workflow | undefined = rootGetters['workflows/workflow'](
      workflowId
    )
    if (typeof workflow !== 'undefined') {
      return getters.service(workflow.serviceId)
    }
    return undefined
  },

  serviceFilteredByRunId: (_state, getters, _rootState, rootGetters) => (
    runId: string
  ): Service | undefined => {
    const run: Run | undefined = rootGetters['runs/run'](runId)
    if (typeof run !== 'undefined') {
      return getters.service(run.serviceId)
    }
    return undefined
  },

  workflowEngines: (_state, getters) => (
    serviceId: string
  ): { name: string; version: string }[] => {
    const service: Service | undefined = getters.service(serviceId)
    if (typeof service !== 'undefined') {
      return Object.entries(service.serviceInfo?.workflow_engine_versions).map(
        ([name, version]: [string, string]) => ({
          name,
          version,
        })
      )
    }
    return []
  },

  workflowLanguages: (_state, getters) => (
    serviceId: string
  ): {
    name: string
    versions: string[]
  }[] => {
    const service: Service | undefined = getters.service(serviceId)
    if (typeof service !== 'undefined') {
      return Object.entries(service.serviceInfo?.workflow_type_versions).map(
        ([name, versions]: [string, WorkflowTypeVersion]) => ({
          name,
          versions: versions.workflow_type_version,
        })
      )
    }
    return []
  },

  workflowEngineVersion: (_state, getters) => (payload: {
    serviceId: string
    workflowEngine: string
  }) => {
    const workflowEngines: {
      name: string
      version: string
    }[] = getters.workflowEngines(payload.serviceId)
    for (const workflowEngine of workflowEngines) {
      if (workflowEngine.name === payload.workflowEngine) {
        return workflowEngine.version
      }
    }
    return ''
  },
}

export const mutations: MutationTree<State> = {
  clearServices(state) {
    for (const serviceId of Object.keys(state)) {
      if (serviceId in state) {
        Vue.delete(state, serviceId)
      }
    }
  },

  deleteService(state, serviceId: string) {
    if (serviceId in state) {
      Vue.delete(state, serviceId)
    }
  },

  setService(state, service: Service) {
    Vue.set(state, service.id, service)
  },

  setProp(
    state,
    payload: {
      key: keyof Service
      value: string | string[] | ServiceInfo
      serviceId: string
    }
  ) {
    if (payload.serviceId in state) {
      Vue.set(state[payload.serviceId], payload.key, payload.value)
    }
  },

  addWorkflowId(state, payload: { serviceId: string; workflowId: string }) {
    if (payload.serviceId in state) {
      state[payload.serviceId]?.workflowIds.push(payload.workflowId)
    }
  },

  addRunId(state, payload: { serviceId: string; runId: string }) {
    if (payload.serviceId in state) {
      state[payload.serviceId]?.runIds.push(payload.runId)
    }
  },
}

export const actions: ActionTree<State, RootState> = {
  clearServices({ commit }) {
    commit('clearServices')
  },

  async submitService(
    { commit, dispatch },
    payload: { name: string; endpoint: string }
  ): Promise<string> {
    const serviceInfo = await getServiceInfo(this.$axios, payload.endpoint)
    const serviceId: string = uuidv4()
    let workflowAttachment = true
    if (typeof serviceInfo?.tags?.workflow_attachment !== 'undefined') {
      workflowAttachment = !!serviceInfo?.tags?.workflow_attachment
    }
    let getRuns = true
    if (typeof serviceInfo?.tags?.get_runs !== 'undefined') {
      getRuns = !!serviceInfo?.tags?.get_runs
    }

    const workflowIds: string[] = []
    if (serviceInfo?.executable_workflows) {
      for (const workflow of serviceInfo?.executable_workflows) {
        const workflowId: string = await dispatch(
          'workflows/addWorkflow',
          {
            serviceId,
            workflow,
          },
          { root: true }
        )
        workflowIds.push(workflowId)
      }
    }

    commit('setService', {
      name: payload.name,
      endpoint: payload.endpoint,
      state: 'Available',
      addedDate: new Date(),
      id: serviceId,
      workflowIds,
      runIds: [],
      serviceInfo,
      registeredOnlyMode: !!serviceInfo?.tags?.registered_only_mode,
      workflowAttachment,
      getRuns,
    })
    return serviceId
  },

  deleteServices({ commit, state, dispatch }, serviceIds: string[]) {
    const workflowIds = serviceIds.flatMap(
      (serviceId: string) => state[serviceId].workflowIds
    )
    const runIds = serviceIds.flatMap(
      (serviceId: string) => state[serviceId].runIds
    )
    for (const serviceId of serviceIds) {
      commit('deleteService', serviceId)
    }
    dispatch('workflows/deleteWorkflows', workflowIds, { root: true })
    dispatch('runs/deleteRuns', runIds, { root: true })
  },

  async updateServiceState({ commit, getters }, serviceId: string) {
    const service: Service | undefined = getters.service(serviceId)
    if (typeof service !== 'undefined') {
      await getServiceInfo(this.$axios, service.endpoint).catch((_) => {
        commit('setProp', { key: 'state', value: 'Disconnect', serviceId })
      })
      commit('setProp', { key: 'state', value: 'Available', serviceId })
    }
  },

  async updateAllServicesState({ getters, dispatch }) {
    const queue = []
    for (const serviceId of getters.serviceIds) {
      queue.push(dispatch('updateServiceState', serviceId))
    }
    await Promise.all(queue)
  },

  addWorkflowId(
    { commit },
    payload: { serviceId: string; workflowId: string }
  ) {
    commit('addWorkflowId', payload)
  },

  removeWorkflowId(
    { commit, state, getters },
    payload: { serviceId: string; workflowId: string }
  ) {
    const service: Service | undefined = getters.service(payload.serviceId)
    if (typeof service !== 'undefined') {
      commit('setProp', {
        key: 'workflowIds',
        value: state[payload.serviceId]?.workflowIds.filter(
          (workflowId) => workflowId !== payload.workflowId
        ),
        serviceId: payload.serviceId,
      })
    }
  },

  addRunId({ commit }, payload: { serviceId: string; runId: string }) {
    commit('addRunId', payload)
  },

  removeRunId(
    { commit, state, getters },
    payload: { serviceId: string; runId: string }
  ) {
    const service: Service | undefined = getters.service(payload.serviceId)
    if (typeof service !== 'undefined') {
      commit('setProp', {
        key: 'runIds',
        value: state[payload.serviceId]?.runIds.filter(
          (runId) => runId !== payload.runId
        ),
        serviceId: payload.serviceId,
      })
    }
  },
}
