import { paths, components } from '@/types/TRS'

export type ServiceInfoResponse =
  paths['/service-info']['get']['responses'][200]['content']['application/json']

export const getServiceInfo = async (
  trsEndpoint: string
): Promise<ServiceInfoResponse> => {
  const response = await fetch(`${trsEndpoint}/service-info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch service info from ${trsEndpoint}/service-info`
    )
  }
  return response.json()
}

export type ToolsResponse =
  paths['/tools']['get']['responses'][200]['content']['application/json']
export const workflowTypes = ['CWL', 'WDL', 'Nextflow', 'Snakemake']
export type WorkflowType = typeof workflowTypes[number]
export type DescriptorType = components['schemas']['DescriptorType']

export const workflowTypeToDescriptorType = (
  wfType: WorkflowType
): DescriptorType => {
  switch (wfType) {
    case 'CWL':
      return 'CWL'
    case 'WDL':
      return 'WDL'
    case 'Nextflow':
      return 'NFL'
    case 'Snakemake':
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
  const url = new URL(`${trsEndpoint}/tools`)
  if (workflowType) {
    const descriptorType = workflowTypeToDescriptorType(workflowType)
    const queryParams = new URLSearchParams({ descriptorType })
    url.search = queryParams.toString()
  } else if (descriptorType) {
    const queryParams = new URLSearchParams({ descriptorType })
    url.search = queryParams.toString()
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.status !== 200) {
    throw new Error(`Failed to fetch tools from ${url}`)
  }
  return response.json()
}

export const generateWfContentUrl = (
  trsEndpoint: string,
  toolId: string,
  version: string,
  descriptorType: DescriptorType
): URL => {
  return new URL(
    `${trsEndpoint}/tools/${toolId}/versions/${version}/PLAIN_${descriptorType}/descriptor`
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
    `${trsEndpoint}/tools/${toolId}/versions/${version}/PLAIN_${descriptorType}/descriptor/${path.replace(
      /^\//,
      ''
    )}`
  )
}

// export type DescriptorResponse =
//   paths['/tools/{id}/versions/{version_id}/{type}/descriptor']['get']['responses'][200]

// export const getDescriptor = async (
//   trsEndpoint: string,
//   id: string
// ): Promise<> => {}

export type FilesResponse =
  paths['/tools/{id}/versions/{version_id}/{type}/files']['get']['responses'][200]['content']['application/json']

export const getFiles = async (
  trsEndpoint: string,
  toolId: string,
  version: string,
  descriptorType: DescriptorType
): Promise<FilesResponse> => {
  const response = await fetch(
    `${trsEndpoint}/tools/${toolId}/versions/${version}/${descriptorType}/files`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  if (response.status !== 200) {
    throw new Error(`Failed to fetch files from ${trsEndpoint}`)
  }
  return response.json()
}
