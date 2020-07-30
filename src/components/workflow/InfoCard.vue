<template>
  <v-card elevation="8" max-width="960" v-if="this.workflow">
    <div class="d-flex align-center px-6 pt-4">
      <div class="card-header" v-html="workflow.name" />
      <v-chip
        :color="$colors.indigo.lighten2"
        class="ml-4"
        label
        small
        text-color="white"
        v-html="`${workflow.type} ${workflow.version}`"
      />
      <v-spacer />
      <nuxt-link
        :style="{ fontSize: '1.2em' }"
        :to="`/service/${service.id}`"
        class="text-decoration-none"
        v-text="service.name"
      />
    </div>
    <div
      class="px-12"
      :style="{
        color: $colors.grey.darken4,
        fontSize: '0.9em',
        fontWeight: '300'
      }"
      v-text="workflow.url"
      v-if="workflow.url"
    />
    <div class="pt-4" />
    <codemirror
      ref="cmEditor"
      :value="workflow.content"
      :options="codeMirrorOptions"
      class="mx-12 elevation-2"
    />
    <div class="pt-6" />
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/base16-light.css'
import { codemirror } from 'vue-codemirror'
import { Service, Workflow } from '@/types'
import Vue from 'vue'

type CodeMirrorOptions = {
  collapseIdentical: boolean
  lineNumbers: boolean
  mode: string
  readOnly: boolean | string
  theme: string
}

type dataObj = {
  codeMirrorOptions: CodeMirrorOptions
}

export default Vue.extend({
  components: {
    codemirror
  },
  props: {
    workflowId: {
      type: String,
      required: true
    }
  },
  data(): dataObj {
    return {
      codeMirrorOptions: {
        collapseIdentical: false,
        lineNumbers: true,
        mode: 'text/yaml',
        readOnly: 'nocursor',
        theme: 'base16-light'
      }
    }
  },
  computed: {
    workflow(): Workflow {
      return this.$store.getters['workflow/workflowFilteredById'](
        this.workflowId
      )
    },
    service(): Service {
      return this.$store.getters['service/serviceFilteredById'](
        this.workflow.serviceId
      )
    }
  }
})
</script>

<style>
.CodeMirror {
  height: 400px !important;
  font-size: 0.9rem !important;
}
.CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
</style>
