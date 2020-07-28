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

export type Service = ServiceInfoResponse & {
  name: string
  endpoint: string
  state: string
  addedDate: Date
  uuid: string
  workflowIds: string[]
}

export type WorkflowParameter = {
  name: string
  type: string
  default: string | null
  optional: boolean
  array: boolean
  other: any
}

export type Workflow = {
  name: string
  type: string
  version: string
  url?: string
  fileName?: string
  content: string | object
  params: WorkflowParameter[]
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

export type WorkflowEngine = {
  name: string
  version: string
}
