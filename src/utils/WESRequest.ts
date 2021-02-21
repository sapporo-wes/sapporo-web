import {
  RunId,
  RunListResponse,
  RunLog,
  RunStatus,
  ServiceInfo,
} from '@/types/WES'
import { NuxtAxiosInstance } from '@nuxtjs/axios'

export const getServiceInfo = async (
  axios: NuxtAxiosInstance,
  endpoint: string
): Promise<ServiceInfo> => {
  const res: ServiceInfo = await axios.$get(`${endpoint}/service-info`)

  return res
}

export const getRuns = async (
  axios: NuxtAxiosInstance,
  endpoint: string
): Promise<RunListResponse> => {
  const res: RunListResponse = await axios.$get(`${endpoint}/runs`)

  return res
}

export const postRuns = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  data: FormData
): Promise<RunId> => {
  const headers = { 'content-type': 'multipart/form-data' }
  const res: RunId = await axios.$post(`${endpoint}/runs`, data, { headers })

  return res
}

export const getRunsId = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  runId: string
): Promise<RunLog> => {
  const res: RunLog = await axios.$get(`${endpoint}/runs/${runId}`)

  return res
}

export const postRunsIdCancel = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  runId: string
): Promise<RunId> => {
  const res: RunId = await axios.$post(`${endpoint}/runs/${runId}/cancel`)

  return res
}

export const getRunsIdStatus = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  runId: string
): Promise<RunStatus> => {
  const res: RunStatus = await axios.$get(`${endpoint}/runs/${runId}/status`)

  return res
}
