<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="600"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header mx-6 pt-4" v-text="'Remove Runs'" />
      <div class="mx-12 my-2" v-text="'These runs will be removed:'" />
      <ul :style="{ paddingLeft: '96px', paddingRight: '96px' }">
        <li v-for="(item, i) in selectedItems" :key="i" v-text="item.runName" />
      </ul>
      <!-- <div
        :style="{
          fontSize: '1.4rem',
          color: $vuetify.theme.themes.light.error,
        }"
        class="text-center"
        v-text="'Are you sure to delete these?'"
      /> -->
      <div class="d-flex justify-end mx-12 mt-4 pb-6">
        <v-btn color="error" outlined @click.stop="deleteSelectedItems">
          <v-icon left v-text="'mdi-trash-can-outline'" />
          <span v-text="'Remove'" />
        </v-btn>
        <v-btn color="info" class="ml-4" outlined @click.stop="$emit('close')">
          <v-icon left v-text="'mdi-close'" />
          <span v-text="'Cancel'" />
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { RunTableItem } from '@/store/runs'

type Data = Record<string, unknown>

type Methods = {
  deleteSelectedItems: () => Promise<void>
}

type Computed = Record<string, unknown>

type Props = {
  dialogShow: boolean
  selectedItems: RunTableItem[]
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
        'runs/deleteRuns',
        this.selectedItems.map((run) => run.runId)
      )
      this.$emit('clearSelected')
      this.$emit('close')
    },
  },
}

export default Vue.extend(options)
</script>
