import {
  AttachedFile,
  ExecutableWorkflows,
  ParseRequest,
  ParseResult,
  RunId,
  RunListResponse,
  RunLog,
  RunRequest,
  RunStatus,
  ServiceInfo,
  SvcInfSpr100,
  Workflow as WesWorkflow,
} from '@/types/WES'
import { convertGitHubUrl, validUrl } from '@/utils'

export const getServiceInfo = async (
  endpoint: string
): Promise<ServiceInfo> => {
  const res = await fetch(`${endpoint}/service-info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch service-info from ${endpoint}`)
  }
  return await res.json()
}

export type WesVersions = '1.0.0' | 'sapporo-1.0.0' | 'sapporo-1.0.1'

export const parseWesVersion = (
  supportedWesVersions: string[]
): WesVersions => {
  let wesVersion: WesVersions = '1.0.0'
  for (const wes of supportedWesVersions) {
    if (wes.includes('sapporo')) {
      if (wes.includes('1.0.0')) {
        wesVersion = 'sapporo-1.0.0'
      } else if (wes.includes('1.0.1')) {
        wesVersion = 'sapporo-1.0.1'
      }
    }
  }
  return wesVersion
}

export const getExecutableWorkflows = async (
  endpoint: string,
  serviceInfo?: ServiceInfo
): Promise<ExecutableWorkflows> => {
  if (!serviceInfo) {
    serviceInfo = await getServiceInfo(endpoint)
  }
  const wesVersion = parseWesVersion(serviceInfo?.supported_wes_versions || [])
  if (wesVersion === 'sapporo-1.0.1') {
    const res = await fetch(`${endpoint}/executable-workflows`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch executable workflows from ${endpoint}`)
    }
    return await res.json()
  } else if (wesVersion === 'sapporo-1.0.0') {
    return (serviceInfo as SvcInfSpr100).executable_workflows || []
  }
  return []
}

export const fetchWorkflowContent = async (
  workflow: WesWorkflow
): Promise<string> => {
  if (validUrl(workflow.workflow_url)) {
    const url = await convertGitHubUrl(workflow.workflow_url)
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch workflow from ${url}`)
    }
    return await res.text()
  } else {
    const fileName = workflow.workflow_url.split('/').slice(-1)[0]
    for (const file of workflow.workflow_attachment as AttachedFile[]) {
      const attachedFileName = file.file_name.split('/').slice(-1)[0]
      if (fileName === attachedFileName) {
        const url = await convertGitHubUrl(file.file_url)
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch workflow from ${url}`)
        }
        return await res.text()
      }
    }
  }
  return ''
}

export const parseWorkflow = async (
  endpoint: string,
  parseRequest: ParseRequest
): Promise<ParseResult> => {
  const formData = new FormData()
  Object.entries(parseRequest).forEach(([key, val]) => {
    if (key && val) {
      if (Array.isArray(val)) {
        val.forEach((v) => formData.append(`${key}`, v))
      } else {
        formData.append(key, val)
      }
    }
  })

  const res = await fetch(`${endpoint}/parse-workflow`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    throw new Error(`Failed to parse workflow from ${endpoint}`)
  }
  return await res.json()
}

export const getRuns = async (endpoint: string): Promise<RunListResponse> => {
  const res = await fetch(`${endpoint}/runs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch run list from ${endpoint}`)
  }
  return await res.json()
}

export interface Attachment {
  file: File
  name: string
}

export const postRuns = async (
  endpoint: string,
  runRequest: RunRequest,
  attachments: Attachment[]
): Promise<RunId> => {
  const formData = new FormData()
  Object.entries(runRequest).forEach(([key, val]) => {
    if (val) {
      if (Array.isArray(val)) {
        val.forEach((v) => formData.append(`${key}[]`, v))
      } else {
        formData.append(key, val)
      }
    }
  })
  attachments.forEach((attachment) => {
    formData.append('workflow_attachment', attachment.file, attachment.name)
  })

  const res = await fetch(`${endpoint}/runs`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    throw new Error(`Failed to post run from ${endpoint}`)
  }
  return await res.json()
}

export const getRunsId = async (
  endpoint: string,
  runId: string
): Promise<RunLog> => {
  const res = await fetch(`${endpoint}/runs/${runId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch runs id from ${endpoint}`)
  }
  return await res.json()
}

export const postRunsIdCancel = async (
  endpoint: string,
  runId: string
): Promise<RunId> => {
  const res = await fetch(`${endpoint}/runs/${runId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to cancel run from ${endpoint}`)
  }
  return await res.json()
}

export const getRunsIdStatus = async (
  endpoint: string,
  runId: string
): Promise<RunStatus> => {
  const res = await fetch(`${endpoint}/runs/${runId}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch run status from ${endpoint}`)
  }
  return await res.json()
}
