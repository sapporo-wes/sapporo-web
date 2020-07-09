export enum RunState {
  'UNKNOWN',
  'QUEUED',
  'INITIALIZING',
  'RUNNING',
  'PAUSED',
  'COMPLETE',
  'EXECUTOR_ERROR',
  'SYSTEM_ERROR',
  'CANCELED',
  'CANCELING'
}

export type WorkflowTypeVersion = {
  workflow_type_version: string[]
}

export type ServiceInfoResponse = {
  authInstructionsUrl: string
  contactInfoUrl: string
  defaultWorkflowEngineParameters: string[]
  supportedFilesystemProtocols: string[]
  supportedWesVersions: string[]
  systemStateCounts: { RunState: number }
  tags: { string: string | boolean }
  workflowEngineVersions: { string: string }
  workflowTypeVersions: { string: WorkflowTypeVersion }
}

export type AgodashiResponse = {
  wf_params: string
  wf_version: string
  wf_type: string
}
