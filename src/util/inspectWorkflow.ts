import yaml from 'js-yaml'

type WorkflowTypeVersion = {
  type: string
  version: string
}

export type CWLWorkflow = {
  cwlVersion: string
  inputs: any[] | { string: any }
}

export const inspectWorkflow = (
  content: object | string
): WorkflowTypeVersion => {
  let workflowObj: object
  if (typeof content === 'string') {
    workflowObj = convertToObject(content)
  } else {
    workflowObj = content
  }

  let type, version: string
  if ('cwlVersion' in workflowObj) {
    type = 'CWL'
  } else {
    type = ''
  }

  if (type === 'CWL') {
    version = (workflowObj as CWLWorkflow).cwlVersion
  } else {
    version = ''
  }

  return { type, version }
}

export const convertToObject = (content: string): object => {
  let workflowObj: object
  try {
    workflowObj = JSON.parse(content)
  } catch (_) {
    try {
      const yamlResult = yaml.safeLoad(content)
      if (typeof yamlResult === 'object') {
        workflowObj = yamlResult
      } else {
        throw new Error('The input string is neither json nor yaml')
      }
    } catch (_) {
      throw new Error('The input string is neither json nor yaml')
    }
  }

  return workflowObj
}
