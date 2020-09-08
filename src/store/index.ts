import { Service, Workflow, Run } from '@/types'

export type RootState = {
  service: {
    services: { [id: string]: Service }
  }
  workflow: {
    workflows: { [id: string]: Workflow }
  }
  run: {
    runs: { [id: string]: Run }
  }
}
