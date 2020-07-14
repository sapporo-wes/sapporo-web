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
        :to="`/service/${service.uuid}`"
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
    <codemirror
      ref="cmEditor"
      :value="workflow.content"
      :options="codeMirrorOptions"
      class="mx-12 pt-2 pb-6"
    />
    <div class="d-flex justify-end pb-6 mr-12">
      <v-btn
        :color="$colors.indigo.darken4"
        @click.stop="prepareDialogShow = true"
        outlined
      >
        <v-icon class="mr-2">mdi-card-bulleted-outline</v-icon>Prepare
      </v-btn>
    </div>
    {{ workflow.params }}
    <prepare-dialog
      :dialogShow="prepareDialogShow"
      :service-id="service.uuid"
      :workflow-id="workflow.uuid"
      @close="prepareDialogShow = false"
    />
  </v-card>
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/base16-light.css'
import { codemirror } from 'vue-codemirror'
import { Service, Workflow } from '@/types'
import PrepareDialog from '@/components/workflow/PrepareDialog.vue'
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
  prepareDialogShow: boolean
}

export default Vue.extend({
  components: {
    codemirror,
    PrepareDialog
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
      },
      prepareDialogShow: false
    }
  },
  computed: {
    workflow(): Workflow {
      return this.$store.getters['workflow/workflowFilterId'](this.workflowId)
    },
    service(): Service {
      return this.$store.getters['service/serviceFilterId'](
        this.workflow.serviceId
      )
    }
  }
})
</script>

<style>
.CodeMirror {
  height: 400px !important;
  font-size: 0.8rem !important;
}
.CodeMirror-lines {
  font-family: 'Fira Code', monospace, sans-serif !important;
}
</style>
