import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { AttachedFile, Workflow as WESWorkflow } from '@/types/WES'
import { RootState } from '@/store'
import { Run } from '@/store/runs'
import { convertGitHubUrl, validUrl } from '@/utils'

export type Workflow = {
  name: string
  type: string
  version: string
  url: string
  content: string
  addedDate: Date
  preRegisteredWorkflowAttachment: AttachedFile[]
  serviceId: string
  id: string
  runIds: string[]
}

export type State = {
  [id: string]: Workflow
}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {
  workflow: (state) => (workflowId: string): Workflow | undefined => {
    return state[workflowId]
  },

  workflows(state): Workflow[] {
    return Object.values(state)
  },

  workflowsByIds: (_state, getters) => (workflowIds: string[]): Run[] => {
    return workflowIds.map((workflowId) => getters.workflow(workflowId))
  },

  workflowIds(state): string[] {
    return Object.keys(state)
  },

  workflowNames(_state, getters): string[] {
    return getters.workflows.map((workflow: Workflow) => workflow.name)
  },

  existId: (_state, getters) => (workflowId: string): boolean => {
    return getters.workflowIds.includes(workflowId)
  },

  existName: (_state, getters) => (workflowName: string): boolean => {
    return getters.workflowNames.includes(workflowName)
  },

  workflowFilteredByRunId: (_state, getters, _rootState, rootGetters) => (
    runId: string
  ): Workflow | undefined => {
    const run: Run | undefined = rootGetters['runs/run'](runId)
    if (typeof run !== 'undefined') {
      return getters.workflow(run.workflowId)
    }
    return undefined
  },
}

export const mutations: MutationTree<State> = {
  clearWorkflows(state) {
    for (const workflowId of Object.keys(state)) {
      if (workflowId in state) {
        Vue.delete(state, workflowId)
      }
    }
  },

  deleteWorkflow(state, workflowId: string) {
    if (workflowId in state) {
      Vue.delete(state, workflowId)
    }
  },

  setWorkflow(state, workflow: Workflow) {
    Vue.set(state, workflow.id, workflow)
  },

  setProp(
    state,
    payload: {
      key: keyof Workflow
      value: string | string[] | boolean | Date
      workflowId: string
    }
  ) {
    if (payload.workflowId in state) {
      Vue.set(state[payload.workflowId], payload.key, payload.value)
    }
  },

  addRunId(state, payload: { workflowId: string; runId: string }) {
    if (payload.workflowId in state) {
      state[payload.workflowId]?.runIds.push(payload.runId)
    }
  },
}

export const actions: ActionTree<State, RootState> = {
  clearWorkflows({ commit }) {
    commit('clearWorkflows')
  },

  submitWorkflow(
    { commit },
    payload: {
      serviceId: string
      name: string
      type: string
      version: string
      url: string
      content: string
    }
  ) {
    const workflowId: string = uuidv4()
    this.commit(
      'services/addWorkflowId',
      {
        serviceId: payload.serviceId,
        workflowId,
      },
      { root: true }
    )
    commit('setWorkflow', {
      name: payload.name,
      type: payload.type,
      version: payload.version,
      url: payload.url,
      content: payload.content,
      addedDate: new Date(),
      preRegisteredWorkflowAttachment: [],
      serviceId: payload.serviceId,
      id: workflowId,
      runIds: [],
    })
    return workflowId
  },

  async addWorkflow(
    { commit },
    payload: { serviceId: string; workflow: WESWorkflow }
  ): Promise<string> {
    const workflowId: string = uuidv4()
    let content = ''
    if (validUrl(payload.workflow.workflow_url)) {
      const url = await convertGitHubUrl(
        this.$axios,
        payload.workflow.workflow_url
      )
      const res = await this.$axios.$get(url)
      if (typeof res === 'string') {
        content = res
      } else {
        content = JSON.stringify(res, null, 2)
      }
    } else {
      const splitPath = payload.workflow.workflow_url.split('/')
      const fileName = splitPath[splitPath.length - 1]
      for (const file of payload.workflow.workflow_attachment) {
        if (file.file_name.includes(fileName)) {
          const url = await convertGitHubUrl(this.$axios, file.file_url)
          const res = await this.$axios.$get(url)
          if (typeof res === 'string') {
            content = res
          } else {
            content = JSON.stringify(res, null, 2)
          }
        }
      }
    }

    commit('setWorkflow', {
      name: payload.workflow.workflow_name,
      type: payload.workflow.workflow_type,
      version: payload.workflow.workflow_type_version,
      url: payload.workflow.workflow_url,
      content,
      addedDate: new Date(),
      preRegisteredWorkflowAttachment: payload.workflow.workflow_attachment,
      serviceId: payload.serviceId,
      id: workflowId,
      runIds: [],
    })
    return workflowId
  },

  deleteWorkflows(
    { commit, state, dispatch, getters, rootState },
    workflowIds: string[]
  ) {
    const runIds = workflowIds.flatMap(
      (workflowId: string) => state[workflowId].runIds
    )
    for (const workflowId of workflowIds) {
      const workflow: Workflow | undefined = getters.workflow(workflowId)
      if (typeof workflow !== 'undefined') {
        dispatch(
          'services/removeWorkflowId',
          {
            serviceId: workflow.serviceId,
            workflowId,
          },
          { root: true }
        )
        commit('deleteWorkflow', workflowId)
      }
    }
    for (const runId of runIds) {
      const run: Run | undefined = rootState.runs[runId]
      if (typeof run !== 'undefined') {
        dispatch(
          'services/removeRunId',
          {
            serviceId: run.serviceId,
            runId,
          },
          { root: true }
        )
        commit('runs/deleteRun', runId, { root: true })
      }
    }
  },

  addRunId({ commit }, payload: { workflowId: string; runId: string }) {
    commit('addRunId', payload)
  },

  removeRunId(
    { commit, state, getters },
    payload: { workflowId: string; runId: string }
  ) {
    const workflow: Workflow | undefined = getters.workflow(payload.workflowId)
    if (typeof workflow !== 'undefined') {
      commit('setProp', {
        key: 'runIds',
        value: state[payload.workflowId]?.runIds.filter(
          (runId) => runId !== payload.runId
        ),
        workflowId: payload.workflowId,
      })
    }
  },
}
