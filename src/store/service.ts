import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { ServiceInfoResponse } from '@/utils/types'
import { v4 as uuidv4 } from 'uuid'

export type Service = ServiceInfoResponse & {
  name: string
  endpoint: string
  state: string
  addedDate: Date
  uuid: string
  workflowIds: string[]
}

type SubmittedService = {
  name: string
  endpoint: string
}

type State = {
  services: Service[]
}

export const state = (): State => ({
  services: []
})

export const getters: GetterTree<State, RootState> = {
  getServiceNames(state: State): string[] {
    return state.services.map((service) => service.name)
  }
}

export const mutations: MutationTree<State> = {
  setServices(state: State, services: Service[]): void {
    state.services = services
  },
  addService(state: State, service: Service): void {
    state.services.push(service)
  }
}

export const actions: ActionTree<State, RootState> = {
  async submitService(
    { commit }: ActionContext<State, any>,
    service: SubmittedService
  ): Promise<string> {
    this.$axios.setBaseURL(service.endpoint)
    const response = await this.$axios.$get('/service-info')
    const serviceId: string = uuidv4()
    commit('addService', {
      name: service.name,
      endpoint: service.endpoint,
      state: 'Available',
      addedDate: new Date(),
      uuid: serviceId,
      workflowIds: [],
      authInstructionsUrl: response.auth_instructions_url || '',
      contactInfoUrl: response.contact_info_url || '',
      defaultWorkflowEngineParameters:
        response.default_workflow_engine_parameters || [],
      supportedFilesystemProtocols:
        response.supported_filesystem_protocols || [],
      supportedWesVersions: response.supported_wes_versions || [],
      systemStateCounts: response.system_state_counts || {},
      tags: response.tags || {},
      workflowEngineVersions: response.workflow_engine_versions || [],
      workflowTypeVersions: response.workflow_type_versions || {}
    })
    return serviceId
  },
  async deleteServices(
    { commit, state }: ActionContext<State, any>,
    serviceIds: string[]
  ): Promise<void> {
    // TODO delete workflows and runs
    commit(
      'setServices',
      state.services.filter((service) => !serviceIds.includes(service.uuid))
    )
  }
}
