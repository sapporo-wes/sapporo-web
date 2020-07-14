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
  workflowTypeVersion: string[]
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

export type Service = ServiceInfoResponse & {
  name: string
  endpoint: string
  state: string
  addedDate: Date
  uuid: string
  workflowIds: string[]
}

export type Workflow = {
  name: string
  type: string
  version: string
  url?: string
  fileName?: string
  content: string | object
  params: string | object
  addedDate: Date
  serviceId: string
  uuid: string
  runIds: string[]
}

export type Run = {
  name: string
  state: string
  addedDate: Date
  workflowId: string
  uuid: string
}

type ValidResult = boolean | string
type Rule = (value: string) => ValidResult

export type FormComponent = Vue & {
  validate: () => boolean
  reset: () => boolean
  resetValidation: () => boolean
}
