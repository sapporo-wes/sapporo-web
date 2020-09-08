import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { Service, Workflow, Run } from '@/types'
import { RunStatus, RunLog, RunListResponse } from '@/types/WES'
import { generateWorkflowParameters } from '@/util/agodashi'
import {
  postRuns,
  getRunsId,
  getRunsIdStatus,
  getRuns
} from '@/util/WESRequest'
import Vue from 'vue'

type State = {
  runs: { [id: string]: Run }
}

export const state = (): State => ({
  runs: {}
})

export const getters: GetterTree<State, RootState> = {
  runsList(state: State): Run[] {
    return Object.values(state.runs)
  },

  runFilteredById: (state: State) => (runId: string): Run => {
    return state.runs[runId]
  },

  runsFilteredByServiceId: (state: State, getters, rootState) => (
    serviceId: string
  ): Run[] => {
    const runIds: string[] = rootState.service.services[serviceId].runIds
    const runs: Run[] = []
    runIds.forEach((runId: string) => {
      runs.push(state.runs[runId])
    })

    return runs
  },

  existId: (state: State, getters) => (runId: string): boolean => {
    return Object.keys(state.runs).includes(runId)
  }
}

export const mutations: MutationTree<State> = {
  clearRuns(state: State): void {
    Vue.set(state, 'runs', {})
  },

  deleteRun(state: State, runId: string): void {
    Vue.delete(state.runs, runId)
  },

  setRuns(state: State, runs: { [id: string]: Run }): void {
    Vue.set(state, 'runs', runs)
  },

  addRun(state: State, payload: { runId: string; run: Run }): void {
    Vue.set(state.runs, payload.runId, payload.run)
  },

  setRunState(state: State, runStatus: RunStatus): void {
    Vue.set(state.runs[runStatus.run_id], 'state', runStatus.state)
  },

  updateRun(state: State, runLog: RunLog): void {
    Vue.set(state.runs[runLog.run_id], 'state', runLog.state)
    Vue.set(state.runs[runLog.run_id], 'runLog', runLog)
  },

  updateRunsState(state: State, runsStatus: RunStatus[]): void {
    runsStatus.forEach((runStatus: RunStatus) => {
      if (state.runs.hasOwnProperty(runStatus.run_id)) {
        Vue.set(state.runs[runStatus.run_id], 'state', runStatus.state)
      }
    })
  }
}

export const actions: ActionTree<State, RootState> = {
  async clearRuns({ commit }: ActionContext<State, any>) {
    commit('clearRuns')
  },

  async deleteRuns(
    { commit, state, dispatch }: ActionContext<State, any>,
    runIds: string[]
  ): Promise<void> {
    for (const runId of runIds) {
      const run = state.runs[runId]
      await dispatch(
        'service/removeRunIdFromRunIds',
        { serviceId: run.serviceId, runId },
        { root: true }
      )
      await dispatch(
        'workflow/removeRunIdFromRunIds',
        { workflowId: run.workflowId, runId },
        { root: true }
      )
      commit('deleteRun', runId)
    }
  },

  async executeRun(
    { dispatch, commit }: ActionContext<State, any>,
    payload: {
      service: Service
      workflow: Workflow
      runName: string
      inputtedValues: { [key: string]: any }
      tags: string
      wfEngineName: string
      wfEngineParams: string
    }
  ): Promise<string> {
    const params = new FormData()
    params.append(
      'workflow_params',
      generateWorkflowParameters(
        payload.workflow.type,
        payload.workflow.version,
        payload.workflow.params,
        payload.inputtedValues
      )
    )
    params.append('workflow_type', payload.workflow.type)
    params.append('workflow_type_version', payload.workflow.version)
    params.append('tags', payload.tags)
    params.append('workflow_engine_name', payload.wfEngineName)
    params.append('workflow_engine_parameters', payload.wfEngineParams)
    params.append('workflow_url', payload.workflow?.url || '')
    const runId = await postRuns(this.$axios, payload.service.endpoint, params)
    const runStatus = await getRunsIdStatus(
      this.$axios,
      payload.service.endpoint,
      runId.run_id
    )
    const runLog = await getRunsId(
      this.$axios,
      payload.service.endpoint,
      runId.run_id
    )

    await dispatch(
      'service/addRunId',
      { serviceId: payload.service.id, runId: runId.run_id },
      { root: true }
    )
    await dispatch(
      'workflow/addRunId',
      { workflowId: payload.workflow.id, runId: runId.run_id },
      { root: true }
    )
    commit('addRun', {
      runId: runId.run_id,
      run: {
        name: payload.runName,
        state: runStatus.state,
        addedDate: new Date(),
        serviceId: payload.service.id,
        workflowId: payload.workflow.id,
        id: runId.run_id,
        runLog
      }
    })

    return runId.run_id
  },

  async updateRunState(
    { commit, rootGetters, getters }: ActionContext<State, any>,
    runId: string
  ): Promise<void> {
    const run: Run = getters.runFilteredById(runId)
    const service: Service = rootGetters['service/serviceFilteredById'](
      run.serviceId
    )
    const runStatus = await getRunsIdStatus(
      this.$axios,
      service.endpoint,
      runId
    ).catch((e) => {
      commit('setRunState', {
        run_id: runId,
        state: 'UNKNOWN'
      })
      return
    })

    commit('updateRunState', runStatus)
  },

  async updateAllRunsState({ commit, rootState }: ActionContext<State, any>) {
    const services: Service[] = Object.values(rootState.service.services)
    for (const service of services) {
      const runListRes: RunListResponse = await getRuns(
        this.$axios,
        service.endpoint
      ).catch((e) => {
        throw e
      })
      commit('updateRunsState', runListRes.runs)
    }
  },

  async updateAllRunsStateByService(
    { commit, rootState }: ActionContext<State, any>,
    serviceId: string
  ) {
    const service: Service = rootState.service.services[serviceId]
    const runListRes: RunListResponse = await getRuns(
      this.$axios,
      service.endpoint
    ).catch((e) => {
      throw e
    })
    commit('updateRunsState', runListRes.runs)
  },

  async updateRun(
    { commit, rootGetters, getters }: ActionContext<State, any>,
    runId: string
  ): Promise<void> {
    const run: Run = getters.runFilteredById(runId)
    const service: Service = rootGetters['service/serviceFilteredById'](
      run.serviceId
    )
    const runLog = await getRunsId(this.$axios, service.endpoint, runId).catch(
      (e) => {
        throw e
      }
    )

    commit('updateRun', runLog)
  }
}
