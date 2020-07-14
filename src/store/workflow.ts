import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { AgodashiResponse, Workflow } from '@/types'
import { RootState } from '@/store'
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
      .map((workflow: Workflow) => workflow.uuid)
      .includes(workflowId)
  },
  workflowFilterId: (state: State) => (workflowId: string): Workflow => {
    return state.workflows.filter(
      (workflow: Workflow) => workflow.uuid === workflowId
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
  }
}

type SubmittedWorkflow = {
  serviceId: string
  name: string
  url: string
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
      params: agodashiRes.wf_params || '',
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
      state.workflows.filter((workflow) => !workflowIds.includes(workflow.uuid))
    )
    await dispatch(
      'run/deleteRuns',
      state.workflows
        .filter((workflow) => workflowIds.includes(workflow.uuid))
        .map((workflow) => workflow.runIds)
        .flat()
    )
  }
}
