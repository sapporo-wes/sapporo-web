import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { readFile } from '@/util'
import { extractWorkflowParameters, inspectWorkflow } from '@/util/agodashi'
import { RootState } from '@/store'
import { Workflow } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'

type State = {
  workflows: { [id: string]: Workflow }
}

export const state = (): State => ({
  workflows: {}
})

export const getters: GetterTree<State, RootState> = {
  workflowsList(state: State): Workflow[] {
    return Object.values(state.workflows)
  },

  workflowNames(state: State): string[] {
    return Object.values(state.workflows).map(
      (workflow: Workflow) => workflow.name
    )
  },

  existName: (state: State, getters) => (workflowName: string): boolean => {
    return getters.workflowNames.includes(workflowName)
  },

  idToName: (state: State) => (workflowId: string): string => {
    return state.workflows[workflowId]?.name
  },

  existWorkflowId: (state: State) => (workflowId: string) => {
    return state.workflows.hasOwnProperty(workflowId)
  },

  workflowFilteredById: (state: State) => (workflowId: string): Workflow => {
    return state.workflows[workflowId]
  },

  workflowFilteredByRunId: (state: State, getters, rootState, rootGetters) => (
    runId: string
  ): Workflow => {
    const run = rootGetters['run/runFilteredById'](runId)
    return getters.workflowFilteredById(run.workflowId)
  }
}

export const mutations: MutationTree<State> = {
  clearWorkflows(state: State): void {
    Vue.set(state, 'workflows', {})
  },

  deleteWorkflow(state: State, workflowId: string): void {
    Vue.delete(state.workflows, workflowId)
  },

  setWorkflows(state: State, workflows: { [id: string]: Workflow }): void {
    Vue.set(state, 'workflows', workflows)
  },

  addWorkflow(
    state: State,
    payload: { workflowId: string; workflow: Workflow }
  ): void {
    Vue.set(state.workflows, payload.workflowId, payload.workflow)
  },

  addRunId(state: State, payload: { workflowId: string; runId: string }) {
    state.workflows[payload.workflowId].runIds.push(payload.runId)
  },

  setRunIds(state: State, payload: { workflowId: string; runIds: string }) {
    Vue.set(state.workflows[payload.workflowId], 'runIds', payload.runIds)
  }
}

export const actions: ActionTree<State, RootState> = {
  async clearWorkflows({ commit }: ActionContext<State, any>) {
    commit('clearWorkflows')
  },

  async submitWorkflow(
    { commit }: ActionContext<State, any>,
    workflow: {
      serviceId: string
      name: string
      url?: string
      file?: File
    }
  ) {
    let content
    if (typeof workflow.url !== 'undefined') {
      content = await this.$axios.$get(workflow.url).catch((e) => {
        throw e
      })
    }
    if (typeof workflow.file !== 'undefined') {
      content = await readFile(workflow.file).catch((e) => {
        throw e
      })
    }

    const wfTypeVersion = inspectWorkflow(content)
    const wfParams = extractWorkflowParameters(content)
    const workflowId: string = uuidv4()

    await this.dispatch(
      'service/addWorkflowId',
      {
        serviceId: workflow.serviceId,
        workflowId
      },
      { root: true }
    )
    commit('addWorkflow', {
      workflowId,
      workflow: {
        name: workflow.name,
        type: wfTypeVersion.type,
        version: wfTypeVersion.version,
        url: workflow?.url,
        fileName: workflow?.file?.name,
        content: content,
        params: wfParams,
        addedDate: new Date(),
        serviceId: workflow.serviceId,
        id: workflowId,
        runIds: []
      }
    })

    return workflowId
  },

  async deleteWorkflows(
    { commit, state, dispatch }: ActionContext<State, any>,
    workflowIds: string[]
  ): Promise<void> {
    const runIds = workflowIds.flatMap(
      (workflowId: string) => state.workflows[workflowId].runIds
    )
    for (const workflowId of workflowIds) {
      const workflow = state.workflows[workflowId]
      await dispatch(
        'service/removeWorkflowIdFromWorkflowIds',
        { serviceId: workflow.serviceId, workflowId },
        { root: true }
      )
      commit('deleteWorkflow', workflowId)
    }

    await dispatch('run/deleteRuns', runIds, { root: true })
  },

  async addRunId(
    { commit }: ActionContext<State, any>,
    payload: { workflowId: string; runId: string }
  ): Promise<void> {
    commit('addRunId', payload)
  },

  async removeRunIdFromRunIds(
    { commit, state }: ActionContext<State, any>,
    payload: { workflowId: string; runId: string }
  ) {
    const runIds = state.workflows[payload.workflowId].runIds.filter(
      (runId: string) => {
        runId !== payload.runId
      }
    )
    commit('setRunIds', { workflowId: payload.workflowId, runIds })
  }
}
