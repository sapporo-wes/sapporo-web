<template>
  <v-dialog
    overlay-opacity="0.8"
    :value="dialogShow"
    width="600"
    @click:outside="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <v-card>
      <div class="d-flex align-center mx-6 pt-4">
        <v-icon color="black" left v-text="'mdi-trash-can-outline'" />
        <div class="card-header" v-text="'Remove Workflow'" />
      </div>
      <div
        class="mx-12 my-2"
        v-text="'The following workflow will be removed:'"
      />
      <ul :style="{ paddingLeft: '96px', paddingRight: '96px' }">
        <li
          v-for="(item, i) in selectedItems"
          :key="i"
          v-text="item.workflowName"
        />
      </ul>
      <div
        class="mx-12 my-2"
        v-text="'Runs associated with this workflow will also be removed.'"
      />
      <div class="d-flex justify-end mx-12 mt-4 pb-6">
        <v-btn color="error" outlined @click.stop="deleteSelectedItems">
          <v-icon left v-text="'mdi-trash-can-outline'" />
          <span v-text="'Remove'" />
        </v-btn>
        <v-btn class="ml-4" color="info" outlined @click.stop="$emit('close')">
          <v-icon left v-text="'mdi-close'" />
          <span v-text="'Cancel'" />
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { WorkflowTableItem } from '@/store/workflows'

export default defineComponent({
  props: {
    dialogShow: {
      type: Boolean,
      default: false,
      required: true,
    },
    selectedItems: {
      type: Array as PropType<WorkflowTableItem[]>,
      default: [] as WorkflowTableItem[],
      required: true,
    },
  },

  methods: {
    async deleteSelectedItems(): Promise<void> {
      await this.$store.dispatch('workflows/deleteWorkflows', {
        workflowIds: (this.selectedItems as WorkflowTableItem[]).map(
          (workflow) => workflow.workflowId
        ),
      })
      this.$emit('close')
    },
  },
})
</script>
