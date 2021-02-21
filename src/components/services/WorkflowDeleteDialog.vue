<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="600"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header pl-6 pt-4" v-text="'Delete Workflows'" />
      <div class="px-12 py-2" v-text="'These workflows will be deleted.'" />
      <ul :style="{ paddingLeft: '96px', paddingRight: '96px' }">
        <li v-for="(item, i) in selectedItems" :key="i" v-text="item.name" />
      </ul>
      <div
        class="px-12 py-2"
        v-text="'Runs associated with these workflows will also be deleted.'"
      />
      <div
        :style="{
          fontSize: '1.4rem',
          color: $vuetify.theme.themes.light.error,
        }"
        class="text-center"
        v-text="'Are you sure to delete it?'"
      />
      <div class="d-flex justify-end px-12 pt-4 pb-6">
        <v-btn color="error" outlined @click.stop="deleteSelectedItems">
          <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
        </v-btn>
        <v-btn color="info" class="ml-4" outlined @click.stop="$emit('close')">
          <v-icon class="mr-2">mdi-close</v-icon>Cancel
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Workflow } from '@/store/workflows'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'

type Data = Record<string, unknown>

type Methods = {
  deleteSelectedItems: () => Promise<void>
}

type Computed = Record<string, unknown>

type Props = {
  dialogShow: boolean
  selectedItems: Workflow[]
}

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  props: {
    dialogShow: {
      type: Boolean,
      default: false,
      required: true,
    },
    selectedItems: {
      type: Array,
      default: [],
      required: true,
    },
  },

  methods: {
    async deleteSelectedItems(): Promise<void> {
      await this.$store.dispatch(
        'workflows/deleteWorkflows',
        (this.selectedItems as Workflow[]).map((workflow) => workflow.id)
      )
      this.$emit('clearSelected')
      this.$emit('close')
    },
  },
}

export default Vue.extend(options)
</script>
