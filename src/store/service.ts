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
      workflowTypeVersions: res.workflow_type_versions || {}
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
