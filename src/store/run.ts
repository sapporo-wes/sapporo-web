import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'

export type Run = {
  name: string
  state: string
  addedDate: Date
  workflowId: string
  uuid: string
}

type State = {
  runs: Run[]
}

export const state = (): State => ({
  runs: []
})

export const getters: GetterTree<State, RootState> = {}

export const mutations: MutationTree<State> = {
  clearRuns(state: State): void {
    state.runs = []
  }
}

export const actions: ActionTree<State, RootState> = {
  async clearRuns({ commit }: ActionContext<State, any>) {
    commit('clearRuns')
  }
}
