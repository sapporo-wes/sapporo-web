import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { ActionTree, GetterTree, MutationTree } from 'vuex'

import { RootState } from '@/store'
import { Run } from '@/store/runs'
import { AttachedFile, Workflow as WesWorkflow } from '@/types/WES'
import { convertGitHubUrl, validUrl } from '@/utils'

dayjs.extend(utc)

export interface Workflow {
  name: string
  type: string
  version: string
  url: string
  content: string
  addedDate: string // utc string
  updatedDate: string // utc string
  preRegistered: boolean
  preRegisteredWorkflowAttachment: AttachedFile[]
  serviceId: string
  id: string
  runIds: string[]
}

export interface WorkflowTableItem {
  workflowId: string
  workflowName: string
  workflowTypeVersion: string
  date: string
  preRegistered: boolean
}

export interface State {
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

  workflowsByIds: (_state, getters) => (workflowIds: string[]): Workflow[] => {
    return workflowIds
      .map((workflowId) => getters.workflow(workflowId))
      .filter((workflow: Workflow | undefined) => workflow)
  },

  workflowIds(state): string[] {
    return Object.keys(state)
  },

  workflowFilteredByRunId: (_state, getters, _rootState, rootGetters) => (
    runId: string
  ): Workflow | undefined => {
    const run: Run | undefined = rootGetters['runs/run'](runId)
    if (run) {
      return getters.workflow(run.workflowId)
    }
  },

  tableItems: (_state, getters) => (workflowIds: string[]) => {
    const items: WorkflowTableItem[] = []
    const workflows: Workflow[] = getters.workflowsByIds(workflowIds)
    for (const workflow of workflows) {
      items.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        workflowTypeVersion: `${workflow.type} ${workflow.version}`,
        date: workflow.preRegistered
          ? dayjs(workflow.updatedDate).local().format('YYYY-MM-DD HH:mm:ss')
          : dayjs(workflow.addedDate).local().format('YYYY-MM-DD HH:mm:ss'),
        preRegistered: workflow.preRegistered,
      })
    }
    return items
  },
}

export const mutations: MutationTree<State> = {
  clearWorkflows(state, force: boolean) {
    for (const workflowId of Object.keys(state)) {
      if (workflowId in state && (force || !state[workflowId].preRegistered)) {
        Vue.delete(state, workflowId)
      }
    }
  },

  deleteWorkflow(state, workflowId: string) {
    Vue.delete(state, workflowId)
  },

  setWorkflow(state, workflow: Workflow) {
    Vue.set(state, workflow.id, workflow)
  },

  setProp(
    state,
    payload: {
      key: keyof Workflow
      value: AttachedFile[] | boolean | string | string | string[]
      workflowId: string
    }
  ) {
    if (payload.workflowId in state) {
      Vue.set(state[payload.workflowId], payload.key, payload.value)
    }
  },
}

export const actions: ActionTree<State, RootState> = {
  clearWorkflows({ commit }, payload: { force?: boolean }) {
    commit('clearWorkflows', !!payload?.force)
  },

  submitWorkflow(
    { commit, dispatch },
    payload: {
      serviceId: string
      name: string
      type: string
      version: string
      url: string
      content: string
      preRegistered: boolean
    }
  ) {
    const workflowId: string = uuidv4()
    dispatch(
      'services/addWorkflowId',
      {
        serviceId: payload.serviceId,
        workflowId,
      },
      { root: true }
    )
    const date = dayjs()
    commit('setWorkflow', {
      name: payload.name,
      type: payload.type,
      version: payload.version,
      url: payload.url,
      content: payload.content,
      addedDate: date,
      updatedDate: date,
      preRegistered: payload.preRegistered,
      preRegisteredWorkflowAttachment: [],
      serviceId: payload.serviceId,
      id: workflowId,
      runIds: [],
    })
    return workflowId
  },

  async addWorkflow(
    { commit },
    payload: {
      serviceId: string
      workflow: WesWorkflow
      preRegistered: boolean
    }
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
      const fileName = payload.workflow.workflow_url.split('/').slice(-1)[0]
      for (const file of payload.workflow.workflow_attachment) {
        const attachedFileName = file.file_name.split('/').slice(-1)[0]
        if (fileName === attachedFileName) {
          const url = await convertGitHubUrl(this.$axios, file.file_url)
          const res = await this.$axios.$get(url)
          if (typeof res === 'string') {
            content = res
          } else {
            content = JSON.stringify(res, null, 2)
          }
          break
        }
      }
    }

    const date = dayjs()
    commit('setWorkflow', {
      name: payload.workflow.workflow_name,
      type: payload.workflow.workflow_type,
      version: payload.workflow.workflow_type_version,
      url: payload.workflow.workflow_url,
      content,
      addedDate: date,
      updatedDate: date,
      preRegistered: payload.preRegistered,
      preRegisteredWorkflowAttachment: payload.workflow.workflow_attachment,
      serviceId: payload.serviceId,
      id: workflowId,
      runIds: [],
    })
    return workflowId
  },

  async updateWorkflow(
    { commit },
    payload: {
      serviceId: string
      workflowId: string
      workflow: WesWorkflow
    }
  ): Promise<void> {
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
      const fileName = payload.workflow.workflow_url.split('/').slice(-1)[0]
      for (const file of payload.workflow.workflow_attachment) {
        const attachedFileName = file.file_name.split('/').slice(-1)[0]
        if (fileName === attachedFileName) {
          const url = await convertGitHubUrl(this.$axios, file.file_url)
          const res = await this.$axios.$get(url)
          if (typeof res === 'string') {
            content = res
          } else {
            content = JSON.stringify(res, null, 2)
          }
          break
        }
      }
    }

    commit('setProp', {
      key: 'type',
      value: payload.workflow.workflow_type,
      workflowId: payload.workflowId,
    })
    commit('setProp', {
      key: 'version',
      value: payload.workflow.workflow_type_version,
      workflowId: payload.workflowId,
    })
    commit('setProp', {
      key: 'url',
      value: payload.workflow.workflow_url,
      workflowId: payload.workflowId,
    })
    commit('setProp', {
      key: 'content',
      value: content,
      workflowId: payload.workflowId,
    })
    commit('setProp', {
      key: 'updatedDate',
      value: dayjs(),
      workflowId: payload.workflowId,
    })
    commit('setProp', {
      key: 'preRegisteredWorkflowAttachment',
      value: payload.workflow.workflow_attachment,
      workflowId: payload.workflowId,
    })
  },

  deleteWorkflows(
    { commit, dispatch, getters, rootGetters },
    payload: { workflowIds: string[]; force?: boolean }
  ) {
    const deletableWorkflows: Workflow[] = payload.workflowIds
      .map((workflowId: string) => getters.workflow(workflowId))
      .filter(
        (workflow: Workflow | undefined) =>
          workflow && (!!payload.force || !workflow.preRegistered)
      )
    const runIds = deletableWorkflows.flatMap(
      (workflow: Workflow) => workflow.runIds
    )
    for (const workflow of deletableWorkflows) {
      dispatch(
        'services/removeWorkflowId',
        {
          serviceId: workflow.serviceId,
          workflowId: workflow.id,
        },
        { root: true }
      )
      commit('deleteWorkflow', workflow.id)
    }
    for (const runId of runIds) {
      const run: Run | undefined = rootGetters['runs/run'](runId)
      if (run) {
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

  addRunId(
    { commit, getters },
    payload: { workflowId: string; runId: string }
  ) {
    const workflow: Workflow | undefined = getters.workflow(payload.workflowId)
    if (workflow) {
      commit('setProp', {
        key: 'runIds',
        value: Array.from(new Set([...workflow.runIds, payload.runId])),
        workflowId: payload.workflowId,
      })
    }
  },

  removeRunId(
    { commit, getters },
    payload: { workflowId: string; runId: string }
  ) {
    const workflow: Workflow | undefined = getters.workflow(payload.workflowId)
    if (workflow) {
      commit('setProp', {
        key: 'runIds',
        value: workflow.runIds.filter((runId) => runId !== payload.runId),
        workflowId: payload.workflowId,
      })
    }
  },
}
