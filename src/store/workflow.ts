import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'

export type Workflow = {
  name: string
  type: string
  version: string
  url?: string
  fileName?: string
  content: string
  addedDate: Date
  serviceId: string
  uuid: string
  runIds: string[]
}

type SubmittedService = {
  name: string
  endpoint: string
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

export const mutations: MutationTree<State> = {}

export const actions: ActionTree<State, RootState> = {
  async submitWorkflow(
    { commit }: ActionContext<State, any>,
    workflow: SubmittedWorkflow
  )
}
