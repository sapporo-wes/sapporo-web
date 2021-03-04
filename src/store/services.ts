import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import colors from 'vuetify/lib/util/colors'
import { ActionTree, GetterTree, MutationTree } from 'vuex'

import { RootState } from '@/store'
import { Run } from '@/store/runs'
import { Workflow } from '@/store/workflows'
import {
  ServiceInfo,
  Workflow as WesWorkflow,
  WorkflowTypeVersion,
} from '@/types/WES'
import { getServiceInfo } from '@/utils/WESRequest'

dayjs.extend(utc)

export type ServiceState = 'Available' | 'Disconnect' | 'Unknown'

export interface Service {
  name: string
  endpoint: string
  state: ServiceState
  addedDate: string // utc string
  updatedDate: string // utc string
  preRegistered: boolean
  id: string
  workflowIds: string[]
  runIds: string[]
  serviceInfo: ServiceInfo
}

export interface State {
  [id: string]: Service
}

export const state = (): State => ({})

export interface WorkflowEngine {
  name: string
  version: string
}

export type WorkflowEngines = WorkflowEngine[]

export interface WorkflowLanguage {
  name: string
  versions: string[]
}

export type WorkflowLanguages = WorkflowLanguage[]

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

  registeredOnlyMode: (_state, getters) => (
    serviceId: string
  ): boolean | undefined => {
    const service: Service | undefined = getters.service(serviceId)
    if (service) {
      return service.serviceInfo.tags.registered_only_mode === true
    }
    return false
  },

  getRuns: (_state, getters) => (serviceId: string): boolean | undefined => {
    const service: Service | undefined = getters.service(serviceId)
    if (service) {
      return service.serviceInfo.tags.workflow_attachment !== false
    }
    return true
  },

  workflowAttachment: (_state, getters) => (
    serviceId: string
  ): boolean | undefined => {
    const service: Service | undefined = getters.service(serviceId)
    if (service) {
      return service.serviceInfo.tags.get_runs !== false
    }
    return true
  },

  stateColor: (_state, getters) => (serviceId: string): string => {
    const service: Service | undefined = getters.service(serviceId)
    if (service) {
      const serviceState = service.state
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
    if (workflow) {
      return getters.service(workflow.serviceId)
    }
  },

  serviceFilteredByRunId: (_state, getters, _rootState, rootGetters) => (
    runId: string
  ): Service | undefined => {
    const run: Run | undefined = rootGetters['runs/run'](runId)
    if (run) {
      return getters.service(run.serviceId)
    }
  },

  workflowEngines: (_state, getters) => (
    serviceId: string
  ): WorkflowEngines => {
    const service: Service | undefined = getters.service(serviceId)
    if (service) {
      return Object.entries(service.serviceInfo.workflow_engine_versions).map(
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
  ): WorkflowLanguages => {
    const service: Service | undefined = getters.service(serviceId)
    if (service) {
      return Object.entries(service.serviceInfo.workflow_type_versions).map(
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
    const workflowEngines: WorkflowEngines = getters.workflowEngines(
      payload.serviceId
    )
    for (const workflowEngine of workflowEngines) {
      if (workflowEngine.name === payload.workflowEngine) {
        return workflowEngine.version
      }
    }
    return ''
  },
}

export const mutations: MutationTree<State> = {
  clearServices(state, force: boolean) {
    for (const serviceId of Object.keys(state)) {
      if (serviceId in state && (force || !state[serviceId].preRegistered)) {
        Vue.delete(state, serviceId)
      }
    }
  },

  deleteService(state, serviceId: string) {
    Vue.delete(state, serviceId)
  },

  setService(state, service: Service) {
    Vue.set(state, service.id, service)
  },

  setProp(
    state,
    payload: {
      key: keyof Service
      value: boolean | string | ServiceInfo | ServiceState | string | string[]
      serviceId: string
    }
  ) {
    if (payload.serviceId in state) {
      Vue.set(state[payload.serviceId], payload.key, payload.value)
      if (
        typeof payload.value === 'object' &&
        'workflow_type_versions' in payload.value
      ) {
        // For reactivity
        const serviceInfo = payload.value
        for (const [key, value] of Object.entries(serviceInfo)) {
          if (value === null || typeof value !== 'object') {
            Vue.set(state[payload.serviceId].serviceInfo, key, value)
          } else {
            for (const [key1, value1] of Object.entries(value)) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              Vue.set(state[payload.serviceId].serviceInfo[key], key1, value1)
            }
          }
        }
      }
    }
  },
}

export const actions: ActionTree<State, RootState> = {
  clearServices({ commit }, payload: { force?: boolean }) {
    commit('clearServices', !!payload?.force)
  },

  async submitService(
    { commit, dispatch },
    payload: {
      name: string
      endpoint: string
      preRegistered: boolean
    }
  ): Promise<string> {
    const { serviceInfo, state } = await getServiceInfo(
      this.$axios,
      payload.endpoint
    )
      .then((serviceInfo) => ({ serviceInfo, state: 'Available' }))
      .catch((_) => ({
        serviceInfo: {
          workflow_type_versions: {},
          supported_wes_versions: [],
          supported_filesystem_protocols: [],
          workflow_engine_versions: {},
          default_workflow_engine_parameters: [],
          system_state_counts: {},
          auth_instructions_url: '',
          contact_info_url: '',
          tags: {},
          executable_workflows: [],
        },
        state: 'Disconnect',
      }))
    const serviceId: string = uuidv4()

    const workflowIds: string[] = []
    if (serviceInfo.executable_workflows) {
      for (const workflow of serviceInfo.executable_workflows) {
        const workflowId: string = await dispatch(
          'workflows/addWorkflow',
          {
            serviceId,
            workflow,
            preRegistered: true,
          },
          { root: true }
        )
        workflowIds.push(workflowId)
      }
    }

    const date = dayjs().utc().format()
    commit('setService', {
      name: payload.name,
      endpoint: payload.endpoint,
      state,
      addedDate: date,
      updateDate: date,
      preRegistered: payload.preRegistered,
      id: serviceId,
      workflowIds,
      runIds: [],
      serviceInfo,
    })
    return serviceId
  },

  deleteServices({ commit, dispatch, getters }, serviceIds: string[]) {
    const deletableServices: Service[] = serviceIds
      .map((serviceId: string) => getters.service(serviceId))
      .filter(
        (service: Service | undefined) => service && !service.preRegistered
      )
    const workflowIds = deletableServices.flatMap(
      (service: Service) => service.workflowIds
    )
    const runIds = deletableServices.flatMap(
      (service: Service) => service.runIds
    )
    for (const service of deletableServices) {
      commit('deleteService', service.id)
    }
    dispatch(
      'workflows/deleteWorkflows',
      { workflowIds, force: true },
      { root: true }
    )
    dispatch('runs/deleteRuns', runIds, { root: true })
  },

  async updateService(
    { commit, getters, rootGetters, dispatch },
    serviceId: string
  ): Promise<void> {
    const service: Service | undefined = getters.service(serviceId)
    if (service) {
      await getServiceInfo(this.$axios, service.endpoint)
        .then(async (serviceInfo) => {
          commit('setProp', {
            key: 'serviceInfo',
            value: serviceInfo,
            serviceId,
          })
          if (serviceInfo.executable_workflows) {
            const fetchedWfNames = new Set(
              serviceInfo.executable_workflows.map(
                (workflow: WesWorkflow) => workflow.workflow_name
              )
            )
            const registeredWfNames = new Set(
              (rootGetters['workflows/workflowsByIds'](
                service.workflowIds
              ) as Workflow[])
                .filter((workflow: Workflow) => workflow.preRegistered)
                .map((workflow: Workflow) => workflow.name)
            )
            for (const wfName of new Set([
              ...fetchedWfNames,
              ...registeredWfNames,
            ])) {
              if (fetchedWfNames.has(wfName) && registeredWfNames.has(wfName)) {
                await dispatch(
                  'workflows/updateWorkflow',
                  {
                    serviceId,
                    workflowId: (rootGetters['workflows/workflowsByIds'](
                      service.workflowIds
                    ) as Workflow[]).filter(
                      (workflow: Workflow) => workflow.name === wfName
                    )[0].id,
                    workflow: serviceInfo.executable_workflows.filter(
                      (workflow: WesWorkflow) =>
                        workflow.workflow_name === wfName
                    )[0],
                  },
                  { root: true }
                )
              } else if (
                fetchedWfNames.has(wfName) &&
                !registeredWfNames.has(wfName)
              ) {
                const workflowId: string = await dispatch(
                  'workflows/addWorkflow',
                  {
                    serviceId,
                    workflow: serviceInfo.executable_workflows.filter(
                      (workflow: WesWorkflow) =>
                        workflow.workflow_name === wfName
                    )[0],
                    preRegistered: true,
                  },
                  { root: true }
                )
                dispatch('addWorkflowId', { serviceId, workflowId })
              } else if (
                !fetchedWfNames.has(wfName) &&
                registeredWfNames.has(wfName)
              ) {
                dispatch(
                  'workflows/deleteWorkflows',
                  {
                    workflowIds: [
                      (rootGetters['workflows/workflowsByIds'](
                        service.workflowIds
                      ) as Workflow[]).filter(
                        (workflow: Workflow) => workflow.name === wfName
                      )[0].id,
                    ],
                    force: true,
                  },
                  { root: true }
                )
              }
            }
          }
          commit('setProp', { key: 'state', value: 'Available', serviceId })
        })
        .catch((_) => {
          commit('setProp', { key: 'state', value: 'Disconnect', serviceId })
        })
      commit('setProp', {
        key: 'updatedDate',
        value: dayjs().utc().format(),
        serviceId,
      })
    }
  },

  async updateAllServices({ getters, dispatch }) {
    const queue = []
    for (const serviceId of getters.serviceIds) {
      queue.push(dispatch('updateService', serviceId))
    }
    await Promise.all(queue)
  },

  addWorkflowId(
    { commit, getters },
    payload: { serviceId: string; workflowId: string }
  ) {
    const service: Service | undefined = getters.service(payload.serviceId)
    if (service) {
      commit('setProp', {
        key: 'workflowIds',
        value: Array.from(
          new Set([...service.workflowIds, payload.workflowId])
        ),
        serviceId: payload.serviceId,
      })
    }
  },

  removeWorkflowId(
    { commit, getters },
    payload: { serviceId: string; workflowId: string }
  ) {
    const service: Service | undefined = getters.service(payload.serviceId)
    if (service) {
      commit('setProp', {
        key: 'workflowIds',
        value: service.workflowIds.filter(
          (workflowId) => workflowId !== payload.workflowId
        ),
        serviceId: payload.serviceId,
      })
    }
  },

  addRunId({ commit, getters }, payload: { serviceId: string; runId: string }) {
    const service: Service | undefined = getters.service(payload.serviceId)
    if (service) {
      commit('setProp', {
        key: 'runIds',
        value: Array.from(new Set([...service.runIds, payload.runId])),
        serviceId: payload.serviceId,
      })
    }
  },

  removeRunId(
    { commit, getters },
    payload: { serviceId: string; runId: string }
  ) {
    const service: Service | undefined = getters.service(payload.serviceId)
    if (service) {
      commit('setProp', {
        key: 'runIds',
        value: service.runIds.filter((runId) => runId !== payload.runId),
        serviceId: payload.serviceId,
      })
    }
  },
}
