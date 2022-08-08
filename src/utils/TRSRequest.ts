import { paths } from '@/types/TRS'

export type ServiceInfoResponse =
  paths['/service-info']['get']['responses'][200]['content']['application/json']

export const getServiceInfo = async (
  trsEndpoint: string
): Promise<ServiceInfoResponse> => {
  const res = await fetch(`${trsEndpoint}/service-info`, {
    method: 'GET',
  }).catch((e) => {
    throw new Error(
      `Failed to get service info from ${trsEndpoint} due to ${e}`
    )
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch service info from ${trsEndpoint} with status ${res.status}`
    )
  }

  return res.json()
}

export type ToolsResponse =
  paths['/tools']['get']['responses'][200]['content']['application/json']
export const workflowTypes = [
  'CWL',
  'WDL',
  'Nextflow',
  'nextflow',
  'NFL',
  'Snakemake',
  'snakemake',
  'SMK',
]
export type WorkflowType = typeof workflowTypes[number]
export const descriptorTypes = ['CWL', 'WDL', 'NFL', 'SMK']
export type DescriptorType = typeof descriptorTypes[number]

export const workflowTypeToDescriptorType = (
  wfType: WorkflowType
): DescriptorType => {
  switch (wfType) {
    case 'CWL':
    case 'cwl':
      return 'CWL'
    case 'WDL':
    case 'wdl':
      return 'WDL'
    case 'Nextflow':
    case 'nextflow':
    case 'NFL':
      return 'NFL'
    case 'Snakemake':
    case 'snakemake':
    case 'SMK':
      return 'SMK'
    default:
      throw new Error(`Unknown workflow type: ${wfType}`)
  }
}

export const descriptorTypeToWorkflowType = (
  descriptorType: DescriptorType
): WorkflowType => {
  switch (descriptorType) {
    case 'CWL':
      return 'CWL'
    case 'WDL':
      return 'WDL'
    case 'NFL':
      return 'Nextflow'
    case 'SMK':
      return 'Snakemake'
    default:
      throw new Error(`Unknown descriptor type: ${descriptorType}`)
  }
}

export const getTools = async (
  trsEndpoint: string,
  workflowType?: WorkflowType,
  descriptorType?: DescriptorType
): Promise<ToolsResponse> => {
  if (!workflowType && !descriptorType) {
    throw new Error('Either workflowType or descriptorType must be specified')
  }
  descriptorType =
    descriptorType || workflowTypeToDescriptorType(workflowType || '')
  if (!descriptorTypes.includes(descriptorType)) {
    throw new Error(`Unknown descriptor type: ${descriptorType}`)
  }

  const url = new URL(`${trsEndpoint}/tools`)
  const queryParams = new URLSearchParams({ descriptorType })
  url.search = queryParams.toString()

  const res = await fetch(url.toString(), {
    method: 'GET',
  }).catch((e) => {
    throw new Error(`Failed to get tools from ${trsEndpoint} due to ${e}`)
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch tools from ${url} with status ${res.status}`
    )
  }

  return res.json()
}

// for Yevis
export const getToolsAll = async (
  trsEndpoint: string
): Promise<ToolsResponse> => {
  const url = new URL(`${trsEndpoint}/tools`)
  const res = await fetch(url.toString(), {
    method: 'GET',
  }).catch((e) => {
    throw new Error(`Failed to get tools from ${trsEndpoint} due to ${e}`)
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch tools from ${url} with status ${res.status}`
    )
  }

  return res.json()
}

export const generateWfContentUrl = (
  trsEndpoint: string,
  toolId: string,
  version: string,
  descriptorType: DescriptorType
): URL => {
  return new URL(
    `${trsEndpoint}/tools/${encodeURIComponent(
      toolId
    )}/versions/${encodeURIComponent(
      version
    )}/PLAIN_${descriptorType}/descriptor`
  )
}

export const generateWfAttachmentUrl = (
  trsEndpoint: string,
  toolId: string,
  version: string,
  descriptorType: DescriptorType,
  path: string
): URL => {
  return new URL(
    `${trsEndpoint}/tools/${encodeURIComponent(
      toolId
    )}/versions/${encodeURIComponent(
      version
    )}/PLAIN_${descriptorType}/descriptor/${path.replace(/^\//, '')}`
  )
}

export type FilesResponse =
  paths['/tools/{id}/versions/{version_id}/{type}/files']['get']['responses'][200]['content']['application/json']

export const getFiles = async (
  trsEndpoint: string,
  toolId: string,
  version: string,
  descriptorType: DescriptorType
): Promise<FilesResponse> => {
  const res = await fetch(
    `${trsEndpoint}/tools/${encodeURIComponent(
      toolId
    )}/versions/${encodeURIComponent(version)}/${descriptorType}/files`,
    {
      method: 'GET',
    }
  ).catch((e) => {
    throw new Error(`Failed to get files from ${trsEndpoint} due to ${e}`)
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch files from ${trsEndpoint} with status ${res.status}`
    )
  }

  return res.json()
}
