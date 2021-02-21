<template>
  <v-breadcrumbs :items="items" large class="pt-2">
    <template #divider>
      <v-icon>mdi-chevron-right</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { Run } from '@/store/runs'
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { Workflow } from '@/store/workflows'
import Vue from 'vue'

type Data = {
  type: string
  id: string
}

type Methods = Record<string, unknown>

type Computed = {
  items: {
    text: string
    nuxt: boolean
    to: string
  }[]
}

type Props = Record<string, unknown>

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  data() {
    return {
      type: '',
      id: '',
    }
  },

  computed: {
    items() {
      const items = [
        {
          text: 'Home',
          nuxt: true,
          to: '/',
        },
      ]
      if (this.type === 'services') {
        const service: Service | undefined = this.$store.getters[
          'services/service'
        ](this.id)
        if (typeof service !== 'undefined') {
          items.push({
            text: service.name,
            nuxt: true,
            to: `/services/${service.id}`,
          })
        }
      } else if (this.type === 'workflows') {
        const workflow: Workflow | undefined = this.$store.getters[
          'workflows/workflow'
        ](this.id)
        if (typeof workflow !== 'undefined') {
          const service: Service | undefined = this.$store.getters[
            'services/service'
          ](workflow.serviceId)
          if (typeof service !== 'undefined') {
            items.push({
              text: service.name,
              nuxt: true,
              to: `/services/${service.id}`,
            })
          }
          items.push({
            text: workflow.name,
            nuxt: true,
            to: `/workflows/${workflow.id}`,
          })
        }
      } else if (this.type === 'runs') {
        const run: Run | undefined = this.$store.getters['runs/run'](this.id)
        if (typeof run !== 'undefined') {
          const workflow: Workflow | undefined = this.$store.getters[
            'workflows/workflow'
          ](run.workflowId)
          if (typeof workflow !== 'undefined') {
            const service: Service | undefined = this.$store.getters[
              'services/service'
            ](run.serviceId)
            if (typeof service !== 'undefined') {
              items.push({
                text: service.name,
                nuxt: true,
                to: `/services/${service.id}`,
              })
            }
            items.push({
              text: workflow.name,
              nuxt: true,
              to: `/workflows/${workflow.id}`,
            })
          }
          items.push({
            text: run.name,
            nuxt: true,
            to: `/runs/${run.id}`,
          })
        }
      }
      return items
    },
  },

  created() {
    const path = this.$route.path
    const splitPath = path.split('/')
    if (splitPath.length === 3) {
      this.type = splitPath[1]
      this.id = splitPath[2]
    }
  },
}

export default Vue.extend(options)
</script>
