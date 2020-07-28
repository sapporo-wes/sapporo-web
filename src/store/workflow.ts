import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { extractWorkflowParameters } from '@/util/extractWorkflowParameters'
import { inspectWorkflow } from '@/util/inspectWorkflow'
import { RootState } from '@/store'
import { v4 as uuidv4 } from 'uuid'
import { Workflow } from '@/types'

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
  file: File | undefined
}

export const actions: ActionTree<State, RootState> = {
  async clearWorkflows({ commit }: ActionContext<State, any>) {
    commit('clearWorkflows')
  },
  async submitWorkflow(
    { commit }: ActionContext<State, any>,
    workflow: SubmittedWorkflow
  ) {
    let content: string
    if (typeof workflow.file === 'undefined') {
      content = await this.$axios.$get(workflow.url).catch(() => {
        throw new Error('An error has occurred on the entered workflow url.')
      })
    } else {
      content = await readFile(workflow.file).catch((e) => {
        throw e
      })
    }
    const workflowTypeVersion = inspectWorkflow(content)
    const workflowParameters = extractWorkflowParameters(
      content,
      workflowTypeVersion.type
    )
    const workflowId: string = uuidv4()
    commit('addWorkflow', {
      name: workflow.name,
      type: workflowTypeVersion.type,
      version: workflowTypeVersion.version,
      url: workflow.url,
      fileName: workflow.file?.name || '',
      content: content,
      params: workflowParameters,
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
        .flat(),
      { root: true }
    )
  }
}

const readFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsText(file)
  })
}
