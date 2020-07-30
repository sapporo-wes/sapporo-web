<template>
  <v-dialog
    :overlay-opacity="overleyOpacity"
    :value="dialogShow"
    :width="width"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div
        class="card-header pl-6 pt-4"
        v-text="`Delete ${firstCapitalizedModelType}`"
      />
      <div class="px-12 py-2" v-text="`These ${modelType}s will be deleted.`" />
      <ul :style="{ paddingLeft: '96px', paddingRight: '96px' }">
        <li v-for="(item, i) in selectedItems" :key="i" v-text="item.name" />
      </ul>
      <div
        class="px-12 py-2"
        v-if="['service', 'workflow'].includes(modelType)"
        v-text="confirmStatement"
      />
      <div
        :style="{ fontSize: '1.4rem', color: $colors.red.darken4 }"
        class="text-center"
        v-text="'Are you sure to delete it?'"
      />
      <div class="d-flex justify-end px-12 pt-4 pb-6">
        <v-btn
          :color="$colors.red.darken4"
          @click="deleteSelectedItems"
          outlined
        >
          <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
        </v-btn>
        <v-btn
          :color="$colors.grey.darken4"
          @click="$emit('close')"
          class="ml-4"
          outlined
        >
          <v-icon class="mr-2">mdi-close</v-icon>Cancel
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Service, Workflow, Run } from '@/types'

type Item = Service | Workflow | Run

export default Vue.extend({
  props: {
    overleyOpacity: {
      type: Number,
      default: 0.8
    },
    width: {
      type: Number,
      default: 600
    },
    dialogShow: {
      type: Boolean,
      default: false,
      required: true
    },
    modelType: {
      type: String,
      default: 'service',
      validator(value: string): boolean {
        return ['service', 'workflow', 'run'].includes(value)
      },
      required: true
    },
    selectedItems: {
      type: Array,
      default: [],
      required: true
    }
  },
  computed: {
    firstCapitalizedModelType(): string {
      return this.modelType.charAt(0).toUpperCase() + this.modelType.slice(1)
    },
    confirmStatement(): string {
      let statement: string
      if (this.modelType === 'service') {
        return 'Workflows and runs associated with these services will also be deleted.'
      } else if (this.modelType === 'workflow') {
        return 'Runs associated with these workflows will also be deleted.'
      }
      return ''
    }
  },
  methods: {
    async deleteSelectedItems(): Promise<void> {
      await this.$store.dispatch(
        `${this.modelType}/delete${this.firstCapitalizedModelType}s`,
        (this.selectedItems as Item[]).map((item: Item) => item.id)
      )
      this.$emit('clearSelected')
      this.$emit('close')
    }
  }
})
</script>
