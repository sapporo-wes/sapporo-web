<template>
  <v-app-bar :color="$colors.indigo.darken2" app elevation="8">
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/">
        SAPPORO
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn class="mr-2" icon v-on="on">
          <v-icon color="white">mdi-cog</v-icon>
        </v-btn>
      </template>
      <v-list class="app-bar-height-margin">
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.title"
          @click.stop="menuAction(menuItem.title)"
        >
          <v-list-item-icon class="ml-2">
            <v-icon v-text="menuItem.icon" />
          </v-list-item-icon>
          <v-list-item-content class="mr-2">
            <v-list-item-title v-text="menuItem.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn href="https://github.com/ddbj/SAPPORO-web" color="white" outlined>
      GitHub
      <v-icon class="ml-2" color="white"> mdi-github </v-icon>
    </v-btn>

    <v-dialog
      v-model="deleteDialogShow"
      overlay-opacity="0.8"
      width="600"
      @click:outside="deleteDialogShow = false"
    >
      <v-card>
        <div class="card-header pl-6 pt-4" v-text="'Delete All Data'" />
        <div
          class="px-12 py-2"
          v-text="'All data (service, workflow, run, etc.) will be deleted.'"
        />
        <div
          class="px-12 py-2 text-center"
          :style="{
            fontSize: '1.4rem',
            color: $vuetify.theme.themes.light.error,
          }"
          v-text="'Are you sure to delete it?'"
        />
        <div class="d-flex justify-end px-12 pt-4 pb-6">
          <v-btn color="error" outlined @click.stop="deleteAction">
            <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
          </v-btn>
          <v-btn
            color="info"
            class="ml-4"
            outlined
            @click.stop="deleteDialogShow = false"
          >
            <v-icon class="mr-2">mdi-close</v-icon>Cancel
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'

type MenuItem = {
  title: string
  icon: string
}

type Data = {
  menuItems: MenuItem[]
  deleteDialogShow: boolean
}

type Methods = {
  menuAction: (title: string) => void
  importData: () => void
  exportData: () => void
  deleteData: () => void
  deleteAction: () => void
}

type Computed = Record<string, unknown>

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
      menuItems: [
        {
          title: 'Import Data',
          icon: 'mdi-application-import',
        },
        {
          title: 'Export Data',
          icon: 'mdi-application-export',
        },
        {
          title: 'Delete Data',
          icon: 'mdi-trash-can',
        },
      ],
      deleteDialogShow: false,
    }
  },

  methods: {
    menuAction(title: string) {
      if (title === 'Import Data') {
        this.importData()
      } else if (title === 'Export Data') {
        this.exportData()
      } else if (title === 'Delete Data') {
        this.deleteData()
      }
    },
    importData() {
      alert('Import Data')
    },
    exportData() {
      alert('Export Data')
    },
    deleteData() {
      this.deleteDialogShow = true
    },
    deleteAction() {
      this.$store.dispatch('services/clearServices')
      this.$store.dispatch('workflows/clearWorkflows')
      this.$store.dispatch('runs/clearRuns')
      this.deleteDialogShow = false
    },
  },
}

export default Vue.extend(options)
</script>

<style scoped>
.v-list-item__icon:first-child {
  margin-right: 16px;
}
</style>
