import { ServiceInfo, RunLog, State } from '@/types/WES'

export type Service = {
  name: string
  endpoint: string
  state: string
  addedDate: Date
  id: string
  workflowIds: string[]
  serviceInfo: ServiceInfo
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
  id: string
  runIds: string[]
}

export type Run = {
  name: string
  state: State
  addedDate: Date
  serviceId: string
  workflowId: string
  id: string
  runLog: RunLog
}

export type WorkflowParameter = {
  name: string
  type: string
  default: string
  required: boolean
  array: boolean
  additionalInfo?: { [key: string]: any }
}

type ValidResult = boolean | string
type Rule = (value: string) => ValidResult

export type FormComponent = Vue & {
  validate: () => boolean
  reset: () => boolean
  resetValidation: () => boolean
}
