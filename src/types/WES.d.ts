/* eslint-disable camelcase */
export type DefaultWorkflowEngineParameter = {
  name: string
  type: string
  default_value: string
}

export type Log = {
  name: string
  cmd: string
  start_time: string
  end_time: string
  stdout: string
  stderr: string
  exit_code: number
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

export type WorkflowTypeVersion = {
  workflow_type_version: string[]
}

export type AttachedFile = {
  file_name: string
  file_url: string
}

export type Workflow = {
  workflow_name: string
  workflow_url: string
  workflow_type: string
  workflow_type_version: string
  workflow_attachment: AttachedFile[]
}

export type ServiceInfo = {
  workflow_type_versions: { [key: string]: WorkflowTypeVersion }
  supported_wes_versions: string[]
  supported_filesystem_protocols: string[]
  workflow_engine_versions: { [key: string]: string }
  default_workflow_engine_parameters: DefaultWorkflowEngineParameter[]
  system_state_counts: { State: number }
  auth_instructions_url: string
  contact_info_url: string
  tags: { [key: string]: string }
  executable_workflows: Workflow[]
}

export type RunStatus = {
  run_id: string
  state: State
}

export type RunListResponse = {
  runs: RunStatus[]
  next_page_token: string
}

export type RunRequest = {
  workflow_params: string
  workflow_type: string
  workflow_type_version: string
  tags: string
  workflow_engine_name: string
  workflow_engine_parameters: string
  workflow_url: string
  workflow_name: string
  workflow_attachment: AttachedFile[]
}

export type RunLog = {
  run_id: string
  request: RunRequest
  state: State
  run_log: Log
  task_logs: Log[]
  outputs: { [key: string]: Record<string, unknown> }
}

export type RunId = {
  run_id: string
}

export type ErrorResponse = {
  msg: string
  status_code: number
}
