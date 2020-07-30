<template>
  <v-app-bar :color="$colors.indigo.darken2" app elevation="8" hide-on-scroll>
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/">
        SAPPORO
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer />
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn class="mr-2" icon v-on="on">
          <v-icon color="white">mdi-cog</v-icon>
        </v-btn>
      </template>
      <v-list class="app-bar-height-margin">
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.title"
          @click="menuAction(menuItem.title)"
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
      <v-icon class="ml-2" color="white">
        mdi-github
      </v-icon>
    </v-btn>
    <v-dialog overlay-opacity="0.8" v-model="deleteDialogShow" width="600">
      <v-card>
        <div class="card-header pl-6 pt-4" v-text="'Delete Data'" />
        <div
          class="px-12 py-2"
          v-text="'All data (service, workflow, run, etc.) will be deleted.'"
        />
        <div
          class="px-12 py-2 text-center"
          :style="{ fontSize: '1.4rem', color: $colors.red.darken4 }"
          v-text="'Are you sure to delete it?'"
        />
        <div class="d-flex justify-end px-12 pt-4 pb-6">
          <v-btn :color="$colors.red.darken4" @click="deleteData" outlined>
            <v-icon class="mr-2">mdi-trash-can-outline</v-icon>Delete
          </v-btn>
          <v-btn
            :color="$colors.grey.darken4"
            @click="deleteDialogShow = false"
            class="ml-4"
            outlined
          >
            <v-icon class="mr-2">mdi-close</v-icon>Cancel
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue'

type MenuItem = {
  title: string
  icon: string
}

type DataObj = {
  menuItems: MenuItem[]
  deleteDialogShow: boolean
}

export default Vue.extend({
  data(): DataObj {
    return {
      menuItems: [
        {
          title: 'Import Data',
          icon: 'mdi-application-import'
        },
        {
          title: 'Export Data',
          icon: 'mdi-application-export'
        },
        {
          title: 'Delete Data',
          icon: 'mdi-trash-can'
        }
      ],
      deleteDialogShow: false
    }
  },
  methods: {
    async menuAction(title: string): Promise<void> {
      if (title === 'Import Data') {
        alert('Import Data')
      } else if (title === 'Export Data') {
        alert('Export Data')
      } else if (title === 'Delete Data') {
        this.deleteDialogShow = true
      }
    },
    async deleteData() {
      await this.$store.dispatch('service/clearServices')
      await this.$store.dispatch('workflow/clearWorkflows')
      await this.$store.dispatch('run/clearRuns')
      this.deleteDialogShow = false
    }
  }
})
</script>

<style scoped>
.v-list-item__icon:first-child {
  margin-right: 16px;
}
</style>
