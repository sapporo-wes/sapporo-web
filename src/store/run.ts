import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { Run } from '@/types'

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
  },
  setRuns(state: State, runs: Run[]): void {
    state.runs = runs
  }
}

export const actions: ActionTree<State, RootState> = {
  async clearRuns({ commit }: ActionContext<State, any>) {
    commit('clearRuns')
  },
  async deleteRuns(
    { commit, state }: ActionContext<State, any>,
    runIds: string[]
  ): Promise<void> {
    commit(
      'setRuns',
      state.runs.filter((run) => !runIds.includes(run.uuid))
    )
  }
}
