import { Service, Workflow, Run } from '@/types'

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
