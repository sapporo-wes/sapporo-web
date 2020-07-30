import yaml from 'js-yaml'
import { WorkflowParameter } from '@/types'

type CWLWorkflow = {
  cwlVersion: string
  inputs: any[] | { [key: string]: any }
}

export const inspectWorkflow = (
  wfContent: string | object
): { type: string; version: string } => {
  const wfObj = parseWfContent(wfContent)

  let type, version: string
  if (typeof wfObj === 'object' && 'cwlVersion' in wfObj) {
    type = 'CWL'
    version = (wfObj as CWLWorkflow).cwlVersion
  } else {
    type = ''
    version = ''
  }

  return { type, version }
}

const parseWfContent = (wfContent: string | object): any => {
  if (typeof wfContent === 'object') {
    return wfContent
  }

  try {
    return JSON.parse(wfContent)
  } catch (_) {
    try {
      return yaml.safeLoad(wfContent)
    } catch (_) {
      throw new Error(
        'It was not possible to parse the contents of the input workflow as a json or yaml. Please check the contents of the input workflow.'
      )
    }
  }
}

export const extractWorkflowParameters = (
  wfContent: string | object
): WorkflowParameter[] => {
  const wfObj = parseWfContent(wfContent)
  const wfType = inspectWorkflow(wfContent).type

  let wfParams: WorkflowParameter[] = []
  if (wfType === 'CWL') {
    wfParams = extractCWL(wfObj as CWLWorkflow)
  }

  return wfParams
}

const extractCWL = (wfObj: CWLWorkflow): WorkflowParameter[] => {
  let wfParams: WorkflowParameter[] = []
  let inputs = wfObj.inputs
  if (Array.isArray(inputs)) {
    for (let input of inputs) {
      wfParams.push(CWLInputFieldToParam(input?.id || '', input))
    }
  } else {
    for (let [id, input] of Object.entries(inputs)) {
      wfParams.push(CWLInputFieldToParam(id, input))
    }
  }

  return wfParams
}

const CWLInputFieldToParam = (id: string, input: any): WorkflowParameter => {
  let type: string = input?.type || ''
  let required: boolean = true
  let array: boolean = false
  if (type.endsWith('?')) {
    type = type.slice(0, -1)
    required = false
  }
  if (type.endsWith('[]')) {
    type = type.slice(0, -2)
    array = true
  }

  let param: WorkflowParameter = {
    name: id,
    type,
    default: input?.default,
    required,
    array,
    additionalInfo: {}
  }
  if (typeof param.additionalInfo === 'object' && 'symbols' in input) {
    param.additionalInfo.symbols = input.symbols
  }
  if (typeof param.additionalInfo === 'object' && 'secondaryFiles' in input) {
    param.additionalInfo.secondaryFiles = input.secondaryFiles
  }

  return param
}

export const generateWorkflowParameters = (
  type: string,
  version: string,
  wfParams: WorkflowParameter[],
  inputtedValues: { [key: string]: any }
): string => {
  if (type === 'CWL') {
    return generateCWLParams(wfParams, inputtedValues)
  }

  return '{}'
}

const generateCWLParams = (
  wfParams: WorkflowParameter[],
  inputtedValues: { [key: string]: any }
): string => {
  const params: { [key: string]: any } = {}
  for (const param of wfParams) {
    if (param.type === 'file') {
      params[param.name] = {
        class: 'File',
        location: inputtedValues[param.name]
      }
    } else {
      params[param.name] = inputtedValues[param.name]
    }
  }

  return JSON.stringify(params)
}
