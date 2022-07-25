<template>
  <v-breadcrumbs class="pt-2" :items="items" large>
    <template #divider>
      <v-icon v-text="'mdi-chevron-right'" />
    </template>
    <template #item="{ item }">
      <v-breadcrumbs-item :nuxt="item.nuxt" :to="item.to">
        <v-icon :color="$colors.grey.darken2" left v-text="item.icon" />
        <span v-text="item.text" />
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Run } from '@/store/runs'
import { Service } from '@/store/services'
import { Workflow } from '@/store/workflows'

export default defineComponent({
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
          icon: 'mdi-home-outline',
        },
      ]
      if (this.type === 'service') {
        const service: Service | undefined = this.$store.getters[
          'services/service'
        ](this.id)
        if (service) {
          items.push({
            text: service.name,
            nuxt: true,
            to: `/services?serviceId=${service.id}`,
            icon: 'mdi-dns-outline',
          })
        }
      } else if (this.type === 'workflow') {
        const workflow: Workflow | undefined = this.$store.getters[
          'workflows/workflow'
        ](this.id)
        if (workflow) {
          const service: Service | undefined = this.$store.getters[
            'services/service'
          ](workflow.serviceId)
          if (service) {
            items.push({
              text: service.name,
              nuxt: true,
              to: `/services?serviceId=${service.id}`,
              icon: 'mdi-dns-outline',
            })
          }
          items.push({
            text: workflow.name,
            nuxt: true,
            to: `/workflows?workflowId=${workflow.id}`,
            icon: 'mdi-graph-outline',
          })
        }
      } else if (this.type === 'run') {
        const run: Run | undefined = this.$store.getters['runs/run'](this.id)
        if (run) {
          const workflow: Workflow | undefined = this.$store.getters[
            'workflows/workflow'
          ](run.workflowId)
          if (workflow) {
            const service: Service | undefined = this.$store.getters[
              'services/service'
            ](run.serviceId)
            if (service) {
              items.push({
                text: service.name,
                nuxt: true,
                to: `/services?serviceId=${service.id}`,
                icon: 'mdi-dns-outline',
              })
            }
            items.push({
              text: workflow.name,
              nuxt: true,
              to: `/workflows?workflowId=${workflow.id}`,
              icon: 'mdi-graph-outline',
            })
          }
          items.push({
            text: run.name,
            nuxt: true,
            to: `/runs?runId=${run.id}`,
            icon: 'mdi-chart-box-outline',
          })
        }
      }
      return items
    },
  },

  created() {
    const query = this.$route.query
    for (const key of Object.keys(query)) {
      if (key.includes('Id')) {
        this.type = key.slice(0, -2)
        let id = query[key] || ''
        if (Array.isArray(id)) {
          id = id[0] || ''
        }
        this.id = id
        break
      }
    }
  },
})
</script>
