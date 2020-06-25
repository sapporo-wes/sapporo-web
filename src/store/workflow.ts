import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'

export type Workflow = {
  name: string
  content: string
  addedDate: Date
  serviceId: string
  uuid: string
  runIds: string[]
}

type State = {
  workflows: Workflow[]
}

export const state = (): State => ({
  workflows: []
})

export const getters: GetterTree<State, RootState> = {}

export const mutations: MutationTree<State> = {}

export const actions: ActionTree<State, RootState> = {}
