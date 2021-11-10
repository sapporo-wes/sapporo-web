import {
  RunId,
  RunListResponse,
  RunLog,
  RunStatus,
  ServiceInfo,
} from '@/types/WES'

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
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
}

export const getRuns = async (endpoint: string): Promise<RunListResponse> => {
  const res = await fetch(`${endpoint}/runs?page_size=50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
}

export const postRuns = async (
  endpoint: string,
  data: FormData
): Promise<RunId> => {
  const res = await fetch(`${endpoint}/runs`, {
    method: 'POST',
    body: data,
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
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
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
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
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
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
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
}
