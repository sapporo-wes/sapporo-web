import { NuxtAxiosInstance } from '@nuxtjs/axios'
import {
  RunId,
  RunListResponse,
  RunLog,
  RunStatus,
  ServiceInfo
} from '@/types/WES'

export const getServiceInfo = async (
  axios: NuxtAxiosInstance,
  endpoint: string
): Promise<ServiceInfo> => {
  const res: ServiceInfo = await axios
    .$get(`${endpoint}/service-info`)
    .catch((e) => {
      throw e
    })

  return res
}

export const getRuns = async (
  axios: NuxtAxiosInstance,
  endpoint: string
): Promise<RunListResponse> => {
  const res: RunListResponse = await axios
    .$get(`${endpoint}/runs`)
    .catch((e) => {
      throw e
    })

  return res
}

export const postRuns = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  params: FormData
): Promise<RunId> => {
  const res: RunId = await axios
    .$post(`${endpoint}/runs`, params)
    .catch((e) => {
      throw e
    })

  return res
}

export const getRunsId = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  runId: string
): Promise<RunLog> => {
  const res: RunLog = await axios
    .$get(`${endpoint}/runs/${runId}`)
    .catch((e) => {
      throw e
    })

  return res
}

export const postRunsIdCancel = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  runId: string
): Promise<RunId> => {
  const res: RunId = await axios
    .$post(`${endpoint}/runs/${runId}/cancel`)
    .catch((e) => {
      throw e
    })

  return res
}

export const getRunsIdStatus = async (
  axios: NuxtAxiosInstance,
  endpoint: string,
  runId: string
): Promise<RunStatus> => {
  const res: RunStatus = await axios
    .$get(`${endpoint}/runs/${runId}/status`)
    .catch((e) => {
      throw e
    })

  return res
}
