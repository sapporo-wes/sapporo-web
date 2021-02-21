import Vue from 'vue'
import colors from 'vuetify/lib/util/colors'
import { ActionTree, GetterTree, MutationTree } from 'vuex'

import { RootState } from '@/store'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'
import {
  RunListResponse,
  RunLog,
  RunStatus,
  State as WesState,
} from '@/types/WES'
import { isYaml, validUrl, yamlToJson } from '@/utils'
import {
  getRuns,
  getRunsId,
  getRunsIdStatus,
  postRuns,
  postRunsIdCancel,
} from '@/utils/WESRequest'

export type Run = {
  name: string
  state: WesState
  addedDate: Date
  serviceId: string
  workflowId: string
  id: string
  runLog: RunLog
}

export type State = { [id: string]: Run }

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {
  run: (state) => (runId: string): Run | undefined => {
    return state[runId]
  },

  runs(state): Run[] {
    return Object.values(state)
  },

  runsByIds: (_state, getters) => (runIds: string[]): Run[] => {
    return runIds
      .map((runId) => getters.run(runId))
      .filter((run: Run | undefined) => typeof run !== 'undefined')
  },

  runIds(state): string[] {
    return Object.keys(state)
  },

  existId: (_state, getters) => (runId: string): boolean => {
    return getters.runIds.includes(runId)
  },

  stateColor: (state) => (runId: string): string => {
    const runState = state[runId]?.state
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
    else return colors.grey.darken1
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
      value: string | WesState | Date | RunLog
      runId: string
    }
  ) {
    if (state[payload.runId]) {
      Vue.set(state[payload.runId], payload.key, payload.value)
      if (typeof payload.value === 'object' && 'run_id' in payload.value) {
        // For reactivity
        const runLog: RunLog = payload.value
        Vue.set(state[payload.runId].runLog, 'state', runLog.state)
        Vue.set(
          state[payload.runId].runLog.run_log,
          'start_time',
          runLog.run_log.start_time
        )
        Vue.set(
          state[payload.runId].runLog.run_log,
          'end_time',
          runLog.run_log.end_time
        )
        Vue.set(
          state[payload.runId].runLog.run_log,
          'stdout',
          runLog.run_log.stdout
        )
        Vue.set(
          state[payload.runId].runLog.run_log,
          'stderr',
          runLog.run_log.stderr
        )
        Vue.set(
          state[payload.runId].runLog.run_log,
          'exit_code',
          runLog.run_log.exit_code
        )
      } else {
        Vue.set(state[payload.runId], payload.key, payload.value)
      }
    }
  },
}

export const actions: ActionTree<State, RootState> = {
  clearRuns({ commit }) {
    commit('clearRuns')
  },

  async executeRun(
    { dispatch, commit },
    payload: {
      service: Service
      workflow: Workflow
      runName: string
      wfEngineName: string
      wfEngineParams: string
      tags: string
      workflowAttachment: Array<File | null>
      fileNames: Array<string | null>
      wfParams: string
    }
  ): Promise<string> {
    const data = new FormData()
    if (payload.service.registeredOnlyMode) {
      data.append('workflow_name', payload.workflow.name)
    } else {
      data.append('workflow_type', payload.workflow.type)
      data.append('workflow_type_version', payload.workflow.version)
      data.append('workflow_url', payload.workflow.url)
      if (
        !validUrl(payload.workflow.url) &&
        payload.service.workflowAttachment
      ) {
        data.append(
          'workflow_attachment[]',
          new Blob([payload.workflow.content]),
          payload.workflow.url
        )
      }
    }
    data.append(
      'workflow_params',
      isYaml(payload.wfParams) ? yamlToJson(payload.wfParams) : payload.wfParams
    )
    data.append('workflow_engine_name', payload.wfEngineName)
    data.append('workflow_engine_parameters', payload.wfEngineParams)
    const tags = JSON.parse(payload.tags)
    if (!('workflow_name' in tags)) {
      tags.workflow_name = payload.workflow.name
    }
    data.append('tags', JSON.stringify(tags))
    if (
      payload.service.workflowAttachment &&
      typeof payload.workflowAttachment !== 'undefined'
    ) {
      for (let i = 0; i < payload.workflowAttachment.length; i++) {
        const file: File | null = payload.workflowAttachment[i]
        if (file !== null) {
          const fileName: string | null = payload.fileNames[i]
          if (fileName === null) {
            data.append('workflow_attachment[]', file)
          } else {
            data.append('workflow_attachment[]', file, fileName)
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

    await dispatch(
      'services/addRunId',
      { serviceId: payload.service.id, runId },
      { root: true }
    )
    await dispatch(
      'workflows/addRunId',
      { workflowId: payload.workflow.id, runId },
      { root: true }
    )
    commit('addRun', {
      name: payload.runName,
      state: runStatus.state,
      addedDate: new Date(),
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
      if (typeof run !== 'undefined') {
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

  async updateRun(
    { commit, rootGetters, getters },
    runId: string
  ): Promise<void> {
    const run: Run = getters.run(runId)
    const service: Service = rootGetters['services/service'](run.serviceId)
    const runStatus = await getRunsIdStatus(
      this.$axios,
      service.endpoint,
      runId
    )
    commit('setProp', {
      key: 'state',
      value: runStatus.state,
      runId: run.id,
    })
    const runLog = await getRunsId(this.$axios, service.endpoint, runId)
    commit('setProp', { key: 'runLog', value: runLog, runId: run.id })
  },

  async updateAllRunsState({ rootState, dispatch }) {
    const services: Service[] = Object.values(rootState.services)
    const queue = []
    for (const service of services) {
      queue.push(await dispatch('updateAllRunsStateByService', service))
    }
    Promise.all(queue)
  },

  async updateAllRunsStateByService({ commit, rootState }, serviceId: string) {
    const service: Service | undefined = rootState.services[serviceId]
    if (typeof service !== 'undefined') {
      if (service.getRuns) {
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
        }
      } else {
        for (const runId of service.runIds) {
          await getRunsIdStatus(this.$axios, service.endpoint, runId)
            .then((runStatus) => {
              commit('setProp', {
                key: 'state',
                value: runStatus.state,
                runId,
              })
            })
            .catch((_) => {
              commit('setProp', {
                key: 'state',
                value: 'UNKNOWN',
                runId,
              })
            })
        }
      }
    }
  },

  async cancelRun({ rootGetters, getters }, runId: string): Promise<void> {
    const run: Run | undefined = getters.run(runId)
    if (typeof run === 'undefined') {
      return
    }
    if (['QUEUED', 'INITIALIZING', 'RUNNING', 'PAUSED'].includes(run.state)) {
      const service: Service | undefined = rootGetters['services/service'](
        run.serviceId
      )
      if (typeof service !== 'undefined') {
        await postRunsIdCancel(this.$axios, service.endpoint, runId)
      }
    }
  },
}
