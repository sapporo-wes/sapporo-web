import { Service } from '@/store/service'
import { Workflow } from '@/store/workflow'
import { Run } from '@/store/run'

export type RootState = {
  service: {
    services: Service[]
  }
  workflow: {
    workflows: Workflow[]
  }
  run: {
    runs: Run[]
  }
}
