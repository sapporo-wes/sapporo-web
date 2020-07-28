import { convertToObject, CWLWorkflow } from '@/util/inspectWorkflow'
import { WorkflowParameter } from '@/types'

export const extractWorkflowParameters = (
  content: string | object,
  workflowType: string
): WorkflowParameter[] => {
  let workflowObj: object
  if (typeof content === 'string') {
    workflowObj = convertToObject(content)
  } else {
    workflowObj = content
  }

  let workflowParameters: WorkflowParameter[]
  if (workflowType === 'CWL') {
    workflowParameters = extractCWL(workflowObj as CWLWorkflow)
  } else {
    workflowParameters = []
  }

  return workflowParameters
}

const extractCWL = (workflowObj: CWLWorkflow): WorkflowParameter[] => {
  let workflowParameters: WorkflowParameter[] = []
  let inputs = workflowObj.inputs
  if (Array.isArray(inputs)) {
    for (let input of inputs) {
      workflowParameters.push(inputToParam(input.id, input))
    }
  } else {
    for (let [id, input] of Object.entries(inputs)) {
      workflowParameters.push(inputToParam(id, input))
    }
  }

  return workflowParameters
}

const inputToParam = (id: string, input: any): WorkflowParameter => {
  let type: string = input.type
  let optional: boolean = false
  let array: boolean = false
  if (type.endsWith('?')) {
    type = type.slice(0, -1)
    optional = true
  }
  if (type.endsWith('[]')) {
    type = type.slice(0, -2)
    array = true
  }

  let param: WorkflowParameter = {
    name: id,
    type: type,
    default: input.default || null,
    optional,
    array,
    other: {}
  }
  if ('symbols' in input) {
    param.other.symbols = input.symbols
  }
  if ('secondaryFiles' in input) {
    param.other.secondaryFiles = input.secondaryFiles
  }

  return param
}
