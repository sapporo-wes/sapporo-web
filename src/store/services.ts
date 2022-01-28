import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import colors from 'vuetify/lib/util/colors'
import { ActionTree, GetterTree, MutationTree } from 'vuex/types'

import { RootState } from '@/store'
import { Run } from '@/store/runs'
import { Workflow } from '@/store/workflows'
import { ServiceInfo } from '@/types/WES'
import {
  getExecutableWorkflows,
  getServiceInfo,
  parseWesVersion,
  WesVersions,
} from '@/utils/WESRequest'

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
  service:
    (state) =>
    (serviceId: string): Service | undefined => {
      return state[serviceId]
    },

  services(state): Service[] {
    return Object.values(state)
  },

  serviceIds(state): string[] {
    return Object.keys(state)
  },

  wesVersion:
    (_state, getters) =>
    (serviceId: string): WesVersions => {
      const service: Service | undefined = getters.service(serviceId)
      return parseWesVersion(service?.serviceInfo?.supported_wes_versions || [])
    },

  registeredOnlyMode:
    (_state, getters) =>
    (serviceId: string): boolean => {
      const service: Service | undefined = getters.service(serviceId)
      return !!service?.serviceInfo?.tags?.registered_only_mode
    },

  getRuns:
    (_state, getters) =>
    (serviceId: string): boolean => {
      const service: Service | undefined = getters.service(serviceId)
      return !!service?.serviceInfo?.tags?.get_runs
    },

  workflowAttachment:
    (_state, getters) =>
    (serviceId: string): boolean => {
      const service: Service | undefined = getters.service(serviceId)
      return !!service?.serviceInfo?.tags?.workflow_attachment
    },

  stateColor:
    (_state, getters) =>
    (serviceId: string): string => {
      const service: Service | undefined = getters.service(serviceId)
      const serviceState = service?.state || 'Unknown'
      switch (serviceState) {
        case 'Available':
          return colors.green.darken1
        case 'Disconnect':
          return colors.red.darken1
        default:
          return colors.grey.darken1
      }
    },

  serviceFilteredByWorkflowId:
    (_state, getters, _rootState, rootGetters) =>
    (workflowId: string): Service | undefined => {
      const workflow: Workflow | undefined =
        rootGetters['workflows/workflow'](workflowId)
      return getters.service(workflow?.serviceId || '')
    },

  serviceFilteredByRunId:
    (_state, getters, _rootState, rootGetters) =>
    (runId: string): Service | undefined => {
      const run: Run | undefined = rootGetters['runs/run'](runId)
      return getters.service(run?.serviceId || '')
    },

  workflowEngines:
    (_state, getters) =>
    (serviceId: string): WorkflowEngines => {
      const service: Service | undefined = getters.service(serviceId)
      return Object.entries(
        service?.serviceInfo?.workflow_engine_versions || []
      ).map(([name, version]) => ({ name, version }))
    },

  workflowLanguages:
    (_state, getters) =>
    (serviceId: string): WorkflowLanguages => {
      const service: Service | undefined = getters.service(serviceId)
      return Object.entries(
        service?.serviceInfo?.workflow_type_versions || []
      ).map(([name, versions]) => ({
        name,
        versions: versions?.workflow_type_version || [],
      }))
    },

  workflowEngineVersion:
    (_state, getters) =>
    (payload: { serviceId: string; workflowEngine: string }) => {
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
      if (state[serviceId].preRegistered) {
        if (force) {
          Vue.delete(state, serviceId)
        }
      } else {
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
      serviceInfo: ServiceInfo
    }
  ): Promise<string> {
    const serviceId: string = uuidv4()
    const workflowIds: string[] = []
    const executableWorkflows =
      (await getExecutableWorkflows(payload.endpoint, payload.serviceInfo)) ||
      []
    for (const workflow of executableWorkflows) {
      const workflowId: string = await dispatch(
        'workflows/addWorkflow',
        { serviceId, workflow, preRegistered: true },
        { root: true }
      )
      workflowIds.push(workflowId)
    }
    const date = dayjs().utc().format()
    const service: Service = {
      name: payload.name,
      endpoint: payload.endpoint,
      state: 'Available',
      addedDate: date,
      updatedDate: date,
      preRegistered: payload.preRegistered,
      id: serviceId,
      workflowIds,
      runIds: [],
      serviceInfo: payload.serviceInfo,
    }

    commit('setService', service)
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
      await getServiceInfo(service.endpoint)
        .then(async (serviceInfo) => {
          commit('setProp', {
            key: 'serviceInfo',
            value: serviceInfo,
            serviceId,
          })
          const executableWfs =
            (await getExecutableWorkflows(service.endpoint, serviceInfo)) || []
          const registeredWfs: Workflow[] = rootGetters[
            'workflows/workflowsByIds'
          ](service.workflowIds).filter((wf: Workflow) => wf.preRegistered)
          const fetchedWfNames = new Set(
            executableWfs.map((wf) => wf.workflow_name)
          )
          const registeredWfNames = new Set(
            registeredWfs.map((wf: Workflow) => wf.name)
          )
          const allWfNames = new Set([...fetchedWfNames, ...registeredWfNames])
          for (const wfName of allWfNames) {
            const preWf = registeredWfs.find(
              (wf: Workflow) => wf.name === wfName
            )
            const newWf = executableWfs.find(
              (wf) => wf.workflow_name === wfName
            )
            if (preWf && newWf) {
              // update
              await dispatch(
                'workflows/updateWorkflow',
                {
                  serviceId,
                  workflowId: preWf.id,
                  workflow: newWf,
                },
                { root: true }
              )
            } else if (newWf) {
              // add
              const workflowId: string = await dispatch(
                'workflows/addWorkflow',
                {
                  serviceId,
                  workflow: newWf,
                  preRegistered: true,
                },
                { root: true }
              )
              dispatch('addWorkflowId', { serviceId, workflowId })
            } else if (preWf) {
              // remove
              dispatch(
                'workflows/deleteWorkflows',
                {
                  workflowIds: [preWf.id],
                  force: true,
                },
                { root: true }
              )
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
