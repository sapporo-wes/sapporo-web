import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { readFile } from '@/util'
import { extractWorkflowParameters, inspectWorkflow } from '@/util/agodashi'
import { RootState } from '@/store'
import { Workflow } from '@/types'
import { v4 as uuidv4 } from 'uuid'

type State = {
  workflows: Workflow[]
}

export const state = (): State => ({
  workflows: []
})

export const getters: GetterTree<State, RootState> = {
  workflowNames(state: State): string[] {
    return state.workflows.map((workflow) => workflow.name)
  },

  existName: (state: State) => (workflowName: string): boolean => {
    return state.workflows
      .map((workflow: Workflow) => workflow.name)
      .includes(workflowName)
  },

  existWorkflowId: (state: State) => (workflowId: string) => {
    return state.workflows
      .map((workflow: Workflow) => workflow.id)
      .includes(workflowId)
  },

  workflowFilteredById: (state: State) => (workflowId: string): Workflow => {
    return state.workflows.filter(
      (workflow: Workflow) => workflow.id === workflowId
    )[0]
  }
}

export const mutations: MutationTree<State> = {
  clearWorkflows(state: State): void {
    state.workflows = []
  },

  setWorkflows(state: State, workflows: Workflow[]): void {
    state.workflows = workflows
  },

  addWorkflow(state: State, workflow: Workflow): void {
    state.workflows.push(workflow)
  },

  addRunId(state: State, payload: { workflowId: string; runId: string }) {
    for (let i = 0; i++; i < state.workflows.length) {
      const workflow = state.workflows[i]
      if (workflow.id === payload.workflowId) {
        state.workflows[i].runIds.push(payload.runId)
        break
      }
    }
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
      content = await this.$axios.$get(workflow.url).catch(() => {
        throw new Error('An error has occurred on the entered workflow url.')
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
    commit('addWorkflow', {
      name: workflow.name,
      type: wfTypeVersion.type,
      version: wfTypeVersion.version,
      url: workflow?.url,
      fileName: workflow?.file?.name,
      content: content,
      params: wfParams,
      addedDate: new Date(),
      serviceId: workflow.serviceId,
      uuid: workflowId,
      runIds: []
    })

    return workflowId
  },

  async deleteWorkflows(
    { commit, state, dispatch }: ActionContext<State, any>,
    workflowIds: string[]
  ): Promise<void> {
    commit(
      'setWorkflows',
      state.workflows.filter((workflow) => !workflowIds.includes(workflow.id))
    )
    await dispatch(
      'run/deleteRuns',
      state.workflows
        .filter((workflow) => workflowIds.includes(workflow.id))
        .map((workflow) => workflow.runIds)
        .flat(),
      { root: true }
    )
  },

  async addRunId(
    { commit }: ActionContext<State, any>,
    payload: { workflowId: string; runId: string }
  ): Promise<void> {
    commit('addRunId', payload)
  }
}
