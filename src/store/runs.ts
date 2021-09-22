import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Vue from 'vue'
import colors from 'vuetify/lib/util/colors'
import { ActionTree, GetterTree, MutationTree } from 'vuex/types'
import { RootState } from '@/store'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import {
  AttachedFile,
  RunListResponse,
  RunLog,
  RunStatus,
  State as WesState,
} from '@/types/WES'
import { validUrl } from '@/utils'
import {
  getRuns,
  getRunsId,
  getRunsIdStatus,
  postRuns,
  postRunsIdCancel,
} from '@/utils/WESRequest'

dayjs.extend(utc)

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
          serviceName: service ? service.name : '',
          workflowId: run.workflowId,
          workflowName: workflow ? workflow.name : '',
          workflowType: workflow ? workflow.type : '',
          workflowVersion: workflow ? workflow.version : '',
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
      if (run) {
        const runState = run.state
        if (runState === 'UNKNOWN') return colors.grey.darken1
        else if (runState === 'QUEUED') return colors.lightBlue.darken1
        else if (runState === 'INITIALIZING') return colors.lightBlue.darken1
        else if (runState === 'RUNNING') return colors.indigo.darken1
        else if (runState === 'PAUSED') return colors.lightBlue.darken1
        else if (runState === 'COMPLETE') return colors.green.darken1
        else if (runState === 'EXECUTOR_ERROR') return colors.red.darken1
        else if (runState === 'SYSTEM_ERROR') return colors.red.darken1
        else if (runState === 'CANCELED') return colors.amber.darken1
        else if (runState === 'CANCELING') return colors.amber.darken1
      }
      return colors.grey.darken1
    },
}

export const mutations: MutationTree<State> = {
  clearRuns(state) {
    for (const runId of Object.keys(state)) {
      if (runId in state) {
        Vue.delete(state, runId)
      }
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
      if (typeof payload.value === 'object' && 'run_id' in payload.value) {
        // For reactivity
        const runLog = payload.value
        for (const [key, value] of Object.entries(runLog)) {
          if (value === null || typeof value !== 'object') {
            Vue.set(state[payload.runId].runLog, key, value)
          } else {
            for (const [key1, value1] of Object.entries(value)) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              Vue.set(state[payload.runId].runLog[key], key1, value1)
            }
          }
        }
      }
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
      workflowAttachment: Array<File | null>
      fileNames: Array<string | null>
      wfParams: string
    }
  ): Promise<string> {
    const data = new FormData()
    if (payload.workflow.preRegistered) {
      data.append('workflow_name', payload.workflow.name)
      data.append('tags', payload.tags)
    } else {
      data.append('workflow_url', payload.workflow.url)
      data.append('workflow_type', payload.workflow.type)
      data.append('workflow_type_version', payload.workflow.version)
      const tags = JSON.parse(payload.tags)
      if (!('workflow_name' in tags)) {
        tags.workflow_name = payload.workflow.name
      }
      data.append('tags', JSON.stringify(tags))
    }
    data.append('workflow_engine_name', payload.wfEngineName)
    data.append('workflow_engine_parameters', payload.wfEngineParams)
    data.append('workflow_params', payload.wfParams)
    data.append('workflow_attachment', payload.wfAttachmentText)

    if (
      !validUrl(payload.workflow.url) &&
      rootGetters['services/workflowAttachment'](payload.service.id)
    ) {
      const wfFileName = payload.workflow.url.split('/').slice(-1)[0]
      const attachedFileNames = [
        ...JSON.parse(payload.wfAttachmentText)
          .map((attachedFile: AttachedFile) => attachedFile.file_name)
          .map((fileName: string) => fileName.split('/').slice(-1)[0]),
        ...(payload.fileNames.filter((fileName) => fileName) as string[]).map(
          (fileName: string) => fileName.split('/').slice(-1)[0]
        ),
      ]
      if (!attachedFileNames.includes(wfFileName)) {
        data.append(
          'workflow_attachment[]',
          new Blob([payload.workflow.content]),
          payload.workflow.url
        )
      }
    }

    if (rootGetters['services/workflowAttachment'](payload.service.id)) {
      for (let i = 0; i < payload.workflowAttachment.length; i++) {
        const file: File | null = payload.workflowAttachment[i]
        if (file) {
          const fileName: string | null = payload.fileNames[i]
          if (fileName) {
            data.append('workflow_attachment[]', file, fileName)
          } else {
            data.append('workflow_attachment[]', file)
          }
        }
      }
    }

    const runId = (await postRuns(this.$axios, payload.service.endpoint, data))
      .run_id

    const runStatus = await getRunsIdStatus(
      this.$axios,
      payload.service.endpoint,
      runId
    )
    const runLog = await getRunsId(this.$axios, payload.service.endpoint, runId)

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
    commit('addRun', {
      name: payload.runName,
      state: runStatus.state,
      addedDate: date,
      updatedDate: date,
      serviceId: payload.service.id,
      workflowId: payload.workflow.id,
      id: runId,
      runLog,
    })

    return runId
  },

  async deleteRuns(
    { commit, dispatch, getters },
    runIds: string[]
  ): Promise<void> {
    for (const runId of runIds) {
      const run: Run | undefined = getters.run(runId)
      if (run) {
        await dispatch(
          'services/removeRunId',
          { serviceId: run.serviceId, runId },
          { root: true }
        )
        await dispatch(
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
    commit('addRun', {
      name: payload.runName,
      state: payload.runLog.state,
      addedDate: date,
      updatedDate: date,
      serviceId: payload.serviceId,
      workflowId: payload.workflowId,
      id: payload.runId,
      runLog: payload.runLog,
    })
  },

  async updateRun(
    { commit, rootGetters, getters },
    runId: string
  ): Promise<void> {
    const run: Run | undefined = getters.run(runId)
    if (run) {
      const service: Service | undefined = rootGetters['services/service'](
        run.serviceId
      )
      if (service) {
        const runLog = await getRunsId(this.$axios, service.endpoint, runId)
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
      if (rootGetters['services/getRuns'](service.id)) {
        const runListRes: RunListResponse = await getRuns(
          this.$axios,
          service.endpoint
        )
        const runsMap: Record<string, RunStatus> = {}
        for (const run of runListRes.runs) {
          runsMap[run.run_id] = run
        }
        for (const runId of service.runIds) {
          if (runId in runsMap) {
            commit('setProp', {
              key: 'state',
              value: runsMap[runId].state,
              runId,
            })
          } else {
            commit('setProp', {
              key: 'state',
              value: 'UNKNOWN',
              runId,
            })
          }
          commit('setProp', {
            key: 'updatedDate',
            value: date,
            runId,
          })
        }
      } else {
        for (const runId of service.runIds) {
          const state = (
            await getRunsIdStatus(this.$axios, service.endpoint, runId).catch(
              (_) => ({
                state: 'UNKNOWN',
              })
            )
          ).state
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
        await postRunsIdCancel(this.$axios, service.endpoint, runId)
      }
    }
  },
}
