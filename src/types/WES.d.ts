import {
  definitions as ga4gh100Def,
  paths as ga4gh100,
} from '@/types/ga4ghWes100'
import {
  definitions as sapporo100Def,
  paths as sapporo100,
} from '@/types/sapporoWes100'
import {
  components as sapporo101Def,
  paths as sapporo101,
} from '@/types/sapporoWes101'

export type SvcInfGa4gh100 =
  ga4gh100['/service-info']['get']['responses'][200]['schema']
export type SvcInfSpr100 =
  sapporo100['/service-info']['get']['responses'][200]['schema']
export type SvcInfSpr101 =
  sapporo101['/service-info']['get']['responses'][200]['content']['application/json']
export type ServiceInfo = SvcInfGa4gh100 | SvcInfSpr100 | SvcInfSpr101

export type AttachedFileSpr100 = sapporo100Def['AttachedFile']
export type AttachedFileSpr101 = sapporo101Def['schemas']['AttachedFile']
export type AttachedFile = Required<AttachedFileSpr100> | AttachedFileSpr101

export type Workflow =
  | Required<sapporo100Def['Workflow']>
  | sapporo101Def['schemas']['Workflow']

export type ExecutableWorkflows =
  | sapporo100['/service-info']['get']['responses'][200]['schema']['executable_workflows']
  | sapporo101['/executable-workflows']['get']['responses'][200]['content']['application/json']

export type ParseRequest =
  sapporo101['/parse-workflow']['post']['requestBody']['content']['multipart/form-data']

export type ParseResult =
  sapporo101['/parse-workflow']['post']['responses'][200]['content']['application/json']

export type State =
  | ga4gh100Def['State']
  | sapporo100Def['State']
  | sapporo101Def['schemas']['State']

export type RunListResponse =
  | ga4gh100['/runs']['get']['responses'][200]['schema']
  | sapporo100['/runs']['get']['responses'][200]['schema']
  | sapporo101['/runs']['get']['responses'][200]['content']['application/json']

export type RunRquGa4gh100 = ga4gh100['/runs']['post']['parameters']['formData']
export type RunRquSpr100 = sapporo100['/runs']['post']['parameters']['formData']
export type RunRquSpr101 =
  sapporo101['/runs']['post']['requestBody']['content']['multipart/form-data']
export type RunRquSpr = RunRquSpr100 | RunRquSpr101
export type RunRequest = RunRquGa4gh100 | RunRquSpr100 | RunRquSpr101

export type RunId =
  | ga4gh100['/runs']['post']['responses'][200]['schema']
  | sapporo100['/runs']['post']['responses'][200]['schema']
  | sapporo101['/runs']['post']['responses'][200]['content']['application/json']

export type RunLogSpr =
  | sapporo100['/runs/{run_id}']['get']['responses'][200]['schema']
  | sapporo101['/runs/{run_id}']['get']['responses'][200]['content']['application/json']

export type RunLog =
  | ga4gh100['/runs/{run_id}']['get']['responses'][200]['schema']
  | sapporo100['/runs/{run_id}']['get']['responses'][200]['schema']
  | sapporo101['/runs/{run_id}']['get']['responses'][200]['content']['application/json']

export type RunStatus =
  | ga4gh100['/runs/{run_id}']['get']['responses'][200]['schema']
  | sapporo100['/runs/{run_id}']['get']['responses'][200]['schema']
  | sapporo101['/runs/{run_id}']['get']['responses'][200]['content']['application/json']
