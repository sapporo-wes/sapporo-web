import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { AgodashiResponse } from '@/utils/types'
import { v4 as uuidv4 } from 'uuid'

export type Workflow = {
  name: string
  type: string
  version: string
  url?: string
  fileName?: string
  content: string | object
  addedDate: Date
  serviceId: string
  uuid: string
  runIds: string[]
}

type SubmittedWorkflow = {
  serviceId: string
  name: string
  url: string
}

type State = {
  workflows: Workflow[]
}

export const state = (): State => ({
  workflows: []
})

export const getters: GetterTree<State, RootState> = {
  getWorkflowNames(state: State): string[] {
    return state.workflows.map((workflow) => workflow.name)
  }
}

export const mutations: MutationTree<State> = {
  clearWorkflows(state: State): void {
    state.workflows = []
  },
  addWorkflow(state: State, workflow: Workflow): void {
    state.workflows.push(workflow)
  }
}

export const actions: ActionTree<State, RootState> = {
  async clearWorkflows({ commit }: ActionContext<State, any>) {
    commit('clearWorkflows')
  },
  async submitWorkflow(
    { commit }: ActionContext<State, any>,
    workflow: SubmittedWorkflow
  ) {
    const urlRes = await this.$axios.$get(workflow.url).catch(() => {
      throw new Error('An error has occurred on the entered workflow url.')
    })
    const formData = new FormData()
    formData.append('wf_url', workflow.url)
    const agodashiRes: AgodashiResponse = await this.$axios
      .$post(`${process.env.agodashiUrl}/inspect-workflow`, formData, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      })
      .catch(() => {
        throw new Error('Agodashi returned an error.')
      })
    const workflowId: string = uuidv4()
    commit('addWorkflow', {
      name: workflow.name,
      type: agodashiRes.wf_type || '',
      version: agodashiRes.wf_version || '',
      url: workflow.url,
      fileName: '',
      content: urlRes,
      addedDate: new Date(),
      serviceId: workflow.serviceId,
      uuid: workflowId,
      runIds: []
    })
    return workflowId
  }
}
