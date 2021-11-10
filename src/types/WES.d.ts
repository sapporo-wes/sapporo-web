/* eslint-disable camelcase */
export interface DefaultWorkflowEngineParameter {
  name: string
  type: string
  default_value: string
}

export type State =
  | 'UNKNOWN'
  | 'QUEUED'
  | 'INITIALIZING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETE'
  | 'EXECUTOR_ERROR'
  | 'SYSTEM_ERROR'
  | 'CANCELED'
  | 'CANCELING'

export interface WorkflowTypeVersion {
  workflow_type_version: string[]
}

// sapporo original implementation
export interface AttachedFile {
  file_name: string
  file_url: string
}

// sapporo original implementation
export interface Workflow {
  workflow_name: string
  workflow_url: string
  workflow_type: string
  workflow_type_version: string
  workflow_attachment: AttachedFile[]
}

export interface SystemStateCounts {
  State: number
}

export interface ServiceInfo {
  workflow_type_versions: { [key: string]: WorkflowTypeVersion }
  supported_wes_versions: string[]
  supported_filesystem_protocols: string[]
  supported_file_system_protocols?: string[]
  workflow_engine_versions: { [key: string]: string }
  default_workflow_engine_parameters: DefaultWorkflowEngineParameter[]
  system_state_counts: SystemStateCounts
  auth_instructions_url: string
  contact_info_url: string
  tags: { [key: string]: string | boolean }
  executable_workflows?: Workflow[] // sapporo original implementation
}

export interface RunStatus {
  run_id: string
  state: State
}

export interface RunListResponse {
  runs: RunStatus[]
  next_page_token: string
}

export interface RunRequest {
  workflow_params: string | Record<string, unknown>
  workflow_type: string
  workflow_type_version: string
  tags: string | Record<string, unknown>
  workflow_engine_name?: string // sapporo original implementation
  workflow_engine_parameters: string | Record<string, unknown>
  workflow_url: string
  workflow_name?: string // sapporo original implementation
  workflow_attachment?: AttachedFile[] // sapporo original implementation
}

export interface Log {
  name: string
  cmd: string
  start_time: string
  end_time: string
  stdout: string
  stderr: string
  exit_code: number
}

export interface CwlWesLog {
  command?: string
  expires?: null
  max_retries?: number
  stdout?: string
  stderr?: string
  task_received?: string // '2021-11-10 01:27:15.123901'
  task_started?: string // '2021-11-10 01:27:15.127852'
  task_finished?: string // '2021-11-10 01:27:15.127852'
  time_queue?: number // 0.004
  time_execution?: number // 274.625
  time_total?: number // 274.626
  utc_offset?: number // 0
}

export interface RunLog {
  run_id: string
  request: RunRequest
  state: State
  run_log: Log | CwlWesLog
  task_logs: Log[]
  outputs: AttachedFile[] | unknown
}

export interface RunId {
  run_id: string
}

export interface ErrorResponse {
  msg: string
  status_code: number
}
