import { State as RunState } from '@/store/runs'
import { State as ServiceState } from '@/store/services'
import { State as WorkflowState } from '@/store/workflows'

export interface RootState {
  services: ServiceState
  workflows: WorkflowState
  runs: RunState
}
