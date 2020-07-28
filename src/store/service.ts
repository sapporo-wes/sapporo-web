import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { Service, WorkflowEngine } from '@/types'
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
    return state.services.map((service: Service) => service.uuid)
  },
  serviceFilterId: (state: State) => (serviceId: string): Service => {
    return state.services.filter(
      (service: Service) => service.uuid === serviceId
    )[0]
  },
  workflowEngines: (state: State) => (serviceId: string): WorkflowEngine[] => {
    const service = state.services.filter(
      (service: Service) => service.uuid === serviceId
    )[0]
    return Object.entries(service.workflowEngineVersions).map(
      ([engineName, engineVersion]: [string, string]): WorkflowEngine => ({
        name: engineName,
        version: engineVersion
      })
    )
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

type SubmittedService = {
  name: string
  endpoint: string
}

export const actions: ActionTree<State, RootState> = {
  async clearServices({ commit }: ActionContext<State, any>) {
    commit('clearServices')
  },
  async submitService(
    { commit }: ActionContext<State, any>,
    service: SubmittedService
  ): Promise<string> {
    const res = await this.$axios
      .$get(`${service.endpoint}/service-info`)
      .catch(() => {
        throw new Error('An error occurred on the entered service endpoint.')
      })
    const serviceId: string = uuidv4()
    commit('addService', {
      name: service.name,
      endpoint: service.endpoint,
      state: 'Available',
      addedDate: new Date(),
      uuid: serviceId,
      workflowIds: [],
      authInstructionsUrl: res.auth_instructions_url || '',
      contactInfoUrl: res.contact_info_url || '',
      defaultWorkflowEngineParameters:
        res.default_workflow_engine_parameters || [],
      supportedFilesystemProtocols: res.supported_filesystem_protocols || [],
      supportedWesVersions: res.supported_wes_versions || [],
      systemStateCounts: res.system_state_counts || {},
      tags: res.tags || {},
      workflowEngineVersions: res.workflow_engine_versions || [],
      workflowTypeVersions: Object.entries(res.workflow_type_versions).reduce(
        (acc, [key, item]: [string, any]) => ({
          ...acc,
          [key]: { workflowTypeVersion: item.workflow_type_version }
        }),
        {}
      )
    })
    return serviceId
  },
  async deleteServices(
    { commit, state, dispatch }: ActionContext<State, any>,
    serviceIds: string[]
  ): Promise<void> {
    commit(
      'setServices',
      state.services.filter((service) => !serviceIds.includes(service.uuid))
    )
    await dispatch(
      'workflow/deleteWorkflows',
      state.services
        .filter((service) => serviceIds.includes(service.uuid))
        .map((service) => service.workflowIds)
        .flat(),
      { root: true }
    )
  }
}
