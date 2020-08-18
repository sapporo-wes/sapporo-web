import { ActionContext, ActionTree, GetterTree, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { Service, Workflow, Run } from '@/types'
import { RunStatus, RunLog } from '@/types/WES'
import { generateWorkflowParameters } from '@/util/agodashi'
import { postRuns, getRunsId, getRunsIdStatus } from '@/util/WESRequest'

type State = {
  runs: Run[]
}

export const state = (): State => ({
  runs: []
})

export const getters: GetterTree<State, RootState> = {
  runFilteredById: (state: State) => (runId: string): Run => {
    return state.runs.filter((run: Run) => run.id === runId)[0]
  }
}

export const mutations: MutationTree<State> = {
  clearRuns(state: State): void {
    state.runs = []
  },

  setRuns(state: State, runs: Run[]): void {
    state.runs = runs
  },

  addRun(state: State, run: Run): void {
    state.runs.push(run)
  },

  updateRunState(state: State, runStatus: RunStatus): void {
    for (let i = 0; i < state.runs.length; i++) {
      if (state.runs[i].id === runStatus.run_id) {
        state.runs[i].state = runStatus.state
        break
      }
    }
  },

  updateRun(state: State, runLog: RunLog): void {
    for (let i = 0; i < state.runs.length; i++) {
      if (state.runs[i].id === runLog.run_id) {
        state.runs[i].state = runLog.state
        state.runs[i].runLog = runLog
        break
      }
    }
  }
}

export const actions: ActionTree<State, RootState> = {
  async clearRuns({ commit }: ActionContext<State, any>) {
    commit('clearRuns')
  },

  async deleteRuns(
    { commit, state }: ActionContext<State, any>,
    runIds: string[]
  ): Promise<void> {
    commit(
      'setRuns',
      state.runs.filter((run) => !runIds.includes(run.id))
    )
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
      'workflow/addRunId',
      { workflowId: payload.workflow.id, runId: runId.run_id },
      { root: true }
    )
    commit('addRun', {
      name: payload.runName,
      state: runStatus.state,
      addedDate: new Date(),
      serviceId: payload.service.id,
      workflowId: payload.workflow.id,
      id: runId.run_id,
      runLog
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
      throw e
    })

    commit('updateRunState', runStatus)
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
