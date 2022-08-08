import dayjs, { extend as dayjsExtend } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Vue from 'vue'
import colors from 'vuetify/lib/util/colors'
import { ActionTree, GetterTree, MutationTree } from 'vuex/types'

import { RootState } from '@/store'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import { RunLog, RunRequest, RunRquSpr, State as WesState } from '@/types/WES'
import {
  Attachment,
  getRunsId,
  getRunsIdStatus,
  postRuns,
  postRunsIdCancel,
  WesVersions,
} from '@/utils/WESRequest'

dayjsExtend(utc)

export type Run = {
  name: string
  state: WesState
  addedDate: string // utc string
  updatedDate: string // utc string
  serviceId: string
  workflowId: string
  id: string
  runLog: RunLog
}

export interface RunTableItem {
  runId: string
  runName: string
  serviceId: string
  serviceName: string
  workflowId: string
  workflowName: string
  workflowType: string
  workflowVersion: string
  addedDate: string
  state: string
  stateColor: string
}

export interface State {
  [id: string]: Run
}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {
  run:
    (state) =>
    (runId: string): Run | undefined => {
      return state[runId]
    },

  runs(state): Run[] {
    return Object.values(state)
  },

  runsByIds:
    (_state, getters) =>
    (runIds: string[]): Run[] => {
      return runIds
        .map((runId) => getters.run(runId))
        .filter((run: Run | undefined) => run)
    },

  runIds(state): string[] {
    return Object.keys(state)
  },

  tableItems:
    (_state, getters, _rootState, rootGetter) =>
    (runIds: string[]): RunTableItem[] => {
      const items: RunTableItem[] = []
      const runs: Run[] = getters.runsByIds(runIds)
      for (const run of runs) {
        const service: Service | undefined = rootGetter['services/service'](
          run.serviceId
        )
        const workflow: Workflow | undefined = rootGetter['workflows/workflow'](
          run.workflowId
        )
        items.push({
          runId: run.id,
          runName: run.name,
          serviceId: run.serviceId,
          serviceName: service?.name || '',
          workflowId: run.workflowId,
          workflowName: workflow?.name || '',
          workflowType: workflow?.type || '',
          workflowVersion: workflow?.version || '',
          addedDate: dayjs(run.addedDate).local().format('YYYY-MM-DD HH:mm:ss'),
          state: run.state,
          stateColor: getters.stateColor(run.id),
        })
      }
      return items
    },

  stateColor:
    (_state, getters) =>
    (runId: string): string => {
      const run: Run | undefined = getters.run(runId)
      const runState = run?.state || 'UNKNOWN'
      switch (runState) {
        case 'QUEUED':
          return colors.lightBlue.darken1
        case 'INITIALIZING':
          return colors.lightBlue.darken1
        case 'RUNNING':
          return colors.indigo.darken1
        case 'PAUSED':
          return colors.lightBlue.darken1
        case 'COMPLETE':
          return colors.green.darken1
        case 'EXECUTOR_ERROR':
          return colors.red.darken1
        case 'SYSTEM_ERROR':
          return colors.red.darken1
        case 'CANCELED':
          return colors.amber.darken1
        case 'CANCELING':
          return colors.amber.darken1
        default:
          return colors.grey.darken1
      }
    },
}

export const mutations: MutationTree<State> = {
  clearRuns(state) {
    for (const runId of Object.keys(state)) {
      Vue.delete(state, runId)
    }
  },

  deleteRun(state, runId: string) {
    if (runId in state) {
      Vue.delete(state, runId)
    }
  },

  addRun(state, run: Run) {
    Vue.set(state, run.id, run)
  },

  setProp(
    state,
    payload: {
      key: keyof Run
      value: RunLog | string | WesState
      runId: string
    }
  ) {
    if (payload.runId in state) {
      Vue.set(state[payload.runId], payload.key, payload.value)
    }
  },
}

export const actions: ActionTree<State, RootState> = {
  clearRuns({ commit }) {
    commit('clearRuns')
  },

  async executeRun(
    { dispatch, commit, rootGetters },
    payload: {
      service: Service
      workflow: Workflow
      runName: string
      wfEngineName: string
      wfEngineParams: string
      tags: string
      wfAttachmentText: string
      workflowAttachment: (File | null)[]
      fileNames: (string | null)[]
      wfParams: string
    }
  ): Promise<string> {
    const wesVersion: WesVersions = rootGetters['services/wesVersion'](
      payload.service.id
    )
    const runRequest: RunRequest = {
      workflow_params: payload.wfParams,
      workflow_type: payload.workflow.type,
      workflow_type_version: payload.workflow.version,
      tags: payload.tags,
      workflow_engine_parameters: payload.wfEngineParams,
      workflow_url: payload.workflow.url,
    }
    if (wesVersion === 'sapporo-1.0.0' || wesVersion === 'sapporo-1.0.1') {
      ;(runRequest as RunRquSpr).workflow_engine_name = payload.wfEngineName
      ;(runRequest as RunRquSpr).workflow_attachment = payload.wfAttachmentText
      if (payload.workflow.preRegistered) {
        ;(runRequest as RunRquSpr).workflow_name = payload.workflow.name
      }
    }
    const attachments: Attachment[] = []
    for (const [i, file] of payload.workflowAttachment.entries()) {
      if (file) {
        const name = payload.fileNames[i] || file.name
        attachments.push({
          file,
          name,
        })
      }
    }
    const runId = (
      await postRuns(
        payload.service.endpoint,
        wesVersion,
        runRequest,
        attachments
      ).catch((e) => {
        throw new Error(`Failed to execute run due to ${e}`)
      })
    ).run_id as string

    dispatch(
      'services/addRunId',
      { serviceId: payload.service.id, runId },
      { root: true }
    )
    dispatch(
      'workflows/addRunId',
      { workflowId: payload.workflow.id, runId },
      { root: true }
    )

    const date = dayjs().utc().format()
    const run: Run = {
      name: payload.runName,
      state: 'QUEUED',
      addedDate: date,
      updatedDate: date,
      serviceId: payload.service.id,
      workflowId: payload.workflow.id,
      id: runId,
      runLog: {},
    }
    commit('addRun', run)

    return runId
  },

  deleteRuns({ commit, dispatch, getters }, runIds: string[]) {
    for (const runId of runIds) {
      const run: Run | undefined = getters.run(runId)
      if (run) {
        dispatch(
          'services/removeRunId',
          { serviceId: run.serviceId, runId },
          { root: true }
        )
        dispatch(
          'workflows/removeRunId',
          { workflowId: run.workflowId, runId },
          { root: true }
        )
        commit('deleteRun', runId)
      }
    }
  },

  addRun(
    { commit, dispatch },
    payload: {
      serviceId: string
      workflowId: string
      runId: string
      runName: string
      runLog: RunLog
    }
  ) {
    dispatch(
      'services/addRunId',
      { serviceId: payload.serviceId, runId: payload.runId },
      { root: true }
    )
    dispatch(
      'workflows/addRunId',
      { workflowId: payload.workflowId, runId: payload.runId },
      { root: true }
    )
    const date = dayjs().utc().format()
    const run: Run = {
      name: payload.runName,
      state: payload.runLog.state || 'UNKNOWN',
      addedDate: date,
      updatedDate: date,
      serviceId: payload.serviceId,
      workflowId: payload.workflowId,
      id: payload.runId,
      runLog: payload.runLog,
    }
    commit('addRun', run)
  },

  updateRun({ commit, rootGetters, getters }, runId: string) {
    const run: Run | undefined = getters.run(runId)
    if (run) {
      const service: Service | undefined = rootGetters['services/service'](
        run.serviceId
      )
      if (service) {
        getRunsId(service.endpoint, runId)
          .then((runLog) => {
            commit('setProp', {
              key: 'state',
              value: runLog.state,
              runId: run.id,
            })
            commit('setProp', { key: 'runLog', value: runLog, runId: run.id })
            commit('setProp', {
              key: 'updatedDate',
              value: dayjs().utc().format(),
              runId: run.id,
            })
          })
          .catch((_) => {
            commit('setProp', {
              key: 'state',
              value: 'UNKNOWN',
              runId: run.id,
            })
            commit('setProp', {
              key: 'updatedDate',
              value: dayjs().utc().format(),
              runId: run.id,
            })
          })
      }
    }
  },

  async updateAllRunsStateByService(
    { commit, rootGetters },
    serviceId: string
  ) {
    const service: Service | undefined =
      rootGetters['services/service'](serviceId)
    if (service) {
      const date = dayjs().utc().format()
      for (const runId of service.runIds) {
        const state = await getRunsIdStatus(service.endpoint, runId)
          .then((res) => res.state)
          .catch((_) => 'UNKNOWN')
        commit('setProp', {
          key: 'state',
          value: state,
          runId,
        })
        commit('setProp', {
          key: 'updatedDate',
          value: date,
          runId,
        })
      }
    }
  },

  async cancelRun({ rootGetters, getters }, runId: string): Promise<void> {
    const run: Run | undefined = getters.run(runId)
    if (
      run &&
      ['QUEUED', 'INITIALIZING', 'RUNNING', 'PAUSED'].includes(run.state)
    ) {
      const service: Service | undefined = rootGetters['services/service'](
        run.serviceId
      )
      if (service) {
        await postRunsIdCancel(service.endpoint, runId).catch((e) => {
          throw new Error(`Failed to cancel run due to ${e}`)
        })
      }
    }
  },
}
