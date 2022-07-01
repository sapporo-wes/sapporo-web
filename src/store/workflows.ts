import dayjs, { extend as dayjsExtend } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { ActionTree, GetterTree, MutationTree } from 'vuex/types'

import { RootState } from '@/store'
import { Run } from '@/store/runs'
import { Service, WorkflowLanguages } from '@/store/services'
import { AttachedFile, Workflow as WesWorkflow } from '@/types/WES'
import {
  generateWfAttachmentUrl,
  generateWfContentUrl,
  getFiles,
  WorkflowType,
  workflowTypeToDescriptorType,
} from '@/utils/TRSRequest'
import {
  fetchWorkflowContent,
  parseWorkflow,
  WesVersions,
} from '@/utils/WESRequest'

dayjsExtend(utc)

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
  workflowType: string
  workflowVersion: string
  date: string
  preRegistered: boolean
}

export interface State {
  [id: string]: Workflow
}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {
  workflow:
    (state) =>
    (workflowId: string): Workflow | undefined => {
      return state[workflowId]
    },

  workflows(state): Workflow[] {
    return Object.values(state)
  },

  workflowsByIds:
    (_state, getters) =>
    (workflowIds: string[]): Workflow[] => {
      return workflowIds
        .map((workflowId) => getters.workflow(workflowId))
        .filter((workflow: Workflow | undefined) => workflow)
    },

  workflowIds(state): string[] {
    return Object.keys(state)
  },

  workflowFilteredByRunId:
    (_state, getters, _rootState, rootGetters) =>
    (runId: string): Workflow | undefined => {
      const run: Run | undefined = rootGetters['runs/run'](runId)
      return getters.workflow(run?.workflowId || '')
    },

  tableItems: (_state, getters) => (workflowIds: string[]) => {
    const items: WorkflowTableItem[] = []
    const workflows: Workflow[] = getters.workflowsByIds(workflowIds)
    for (const workflow of workflows) {
      items.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        workflowType: workflow.type,
        workflowVersion: workflow.version,
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
      const workflow: Workflow = state[workflowId]
      if (workflow.preRegistered) {
        if (force) {
          Vue.delete(state, workflowId)
        }
      } else {
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
      value: AttachedFile[] | boolean | string | string[]
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
    const date = dayjs().utc().format()
    const workflow: Workflow = {
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
    }

    commit('setWorkflow', workflow)
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
    const content = await fetchWorkflowContent(payload.workflow)
    const date = dayjs().utc().format()
    const workflow: Workflow = {
      name: payload.workflow.workflow_name,
      type: payload.workflow.workflow_type,
      version: payload.workflow.workflow_type_version,
      url: payload.workflow.workflow_url,
      content,
      addedDate: date,
      updatedDate: date,
      preRegistered: payload.preRegistered,
      preRegisteredWorkflowAttachment: payload.workflow
        .workflow_attachment as AttachedFile[],
      serviceId: payload.serviceId,
      id: workflowId,
      runIds: [],
    }

    commit('setWorkflow', workflow)
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
    const content = await fetchWorkflowContent(payload.workflow)

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
      value: dayjs().utc().format(),
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
      .filter((workflow: Workflow | undefined) => workflow)
      .filter((workflow: Workflow) => payload.force || !workflow.preRegistered)
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

  async importWorkflowFromTrs(
    { commit, dispatch, rootGetters },
    payload: {
      serviceId: string
      trsEndpoint: string
      trsWorkflowId: string
      trsWorkflowVersion: string
      trsWorkflowType: WorkflowType
      trsWorkflowName: string
    }
  ) {
    const descriptorType = workflowTypeToDescriptorType(payload.trsWorkflowType)
    const url = generateWfContentUrl(
      payload.trsEndpoint,
      payload.trsWorkflowId,
      payload.trsWorkflowVersion,
      descriptorType
    )
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'plain/text',
      },
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch workflow from ${url}`)
    }
    const content = await res.text()

    // attach as file except for CWL
    let strUrl = url.toString()
    if (descriptorType !== 'CWL') {
      strUrl = url.pathname.split('/').pop() || url.toString()
    }

    // inspect wf version
    const service: Service = rootGetters['services/service'](payload.serviceId)
    const wesVersion: WesVersions = rootGetters['services/wesVersion'](
      payload.serviceId
    )
    const wfLangs: WorkflowLanguages = rootGetters[
      'services/workflowLanguages'
    ](payload.serviceId)
    let wfVersion =
      wfLangs.find((wfLang) => wfLang.name === payload.trsWorkflowType)
        ?.versions[0] || descriptorType === 'CWL'
        ? 'v1.0'
        : '1.0'
    if (wesVersion === 'sapporo-1.0.1') {
      parseWorkflow(service.endpoint, {
        workflow_location: url.toString(),
        types_of_parsing: ['workflow_type_version'],
      }).then((res) => {
        wfVersion =
          res.workflow_type_version || descriptorType === 'CWL' ? 'v1.0' : '1.0'
      })
    }

    const files = await getFiles(
      payload.trsEndpoint,
      payload.trsWorkflowId,
      payload.trsWorkflowVersion,
      descriptorType
    )
    const attachmentFiles: AttachedFile[] = []
    for (const file of files) {
      if (file.path) {
        attachmentFiles.push({
          file_name: file.path,
          file_url: generateWfAttachmentUrl(
            payload.trsEndpoint,
            payload.trsWorkflowId,
            payload.trsWorkflowVersion,
            descriptorType,
            file.path
          ).toString(),
        })
      }
    }
    const workflowId: string = uuidv4()
    const date = dayjs().utc().format()

    const workflow: Workflow = {
      name: payload.trsWorkflowName,
      type: payload.trsWorkflowType,
      version: wfVersion,
      url: strUrl,
      content,
      addedDate: date,
      updatedDate: date,
      preRegistered: false,
      preRegisteredWorkflowAttachment: attachmentFiles,
      serviceId: payload.serviceId,
      id: workflowId,
      runIds: [],
    }

    commit('setWorkflow', workflow)
    dispatch(
      'services/addWorkflowId',
      {
        serviceId: payload.serviceId,
        workflowId,
      },
      { root: true }
    )

    return workflowId
  },
}
