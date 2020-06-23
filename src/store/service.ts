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
  workflows: string[]
  runs: string[]
}

type SubmittedService = {
  name: string
  endpoint: string
}

type StateObj = {
  services: Service[]
}

export const state = (): StateObj => ({
  services: []
})

export type State = ReturnType<typeof state>

export const getters: GetterTree<State, RootState> = {
  getServiceNames(state: StateObj): string[] {
    return state.services.map((service) => service.name)
  }
}

export const mutations: MutationTree<State> = {
  setServices(state: StateObj, services: Service[]): void {
    state.services = services
  },
  addService(state: StateObj, service: Service): void {
    state.services.push(service)
  }
}

export const actions: ActionTree<StateObj, RootState> = {
  async submitService(
    { commit }: ActionContext<StateObj, any>,
    service: SubmittedService
  ): Promise<void> {
    this.$axios.setBaseURL(service.endpoint)
    const response = await this.$axios.$get('/service-info')
    commit('addService', {
      name: service.name,
      endpoint: service.endpoint,
      state: 'Available',
      addedDate: new Date(),
      uuid: uuidv4(),
      workflows: [],
      runs: [],
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
  },
  async deleteService(
    { commit, state }: ActionContext<StateObj, any>,
    serviceIds: string[]
  ): Promise<void> {
    // TODO delete workflows and runs
    commit(
      'setServices',
      state.services.filter((service) => !serviceIds.includes(service.uuid))
    )
  }
}
