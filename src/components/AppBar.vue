<template>
  <v-app-bar :color="this.$colors.indigo.darken2" app elevation="8" fixed>
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/">
        SAPPORO
      </nuxt-link>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-menu offset-y="">
      <template v-slot:activator="{ on }">
        <v-btn class="mr-2" icon v-on="on">
          <v-icon color="white">mdi-cog</v-icon>
        </v-btn>
      </template>
      <v-list class="app-bar-height-margin">
        <v-list-item
          :key="menuItem.title"
          @click="menuItem.action"
          v-for="menuItem in this.menuItems"
        >
          <v-list-item-icon class="ml-2">
            <v-icon v-text="menuItem.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content class="mr-2">
            <v-list-item-title
              class="info--text"
              v-text="menuItem.title"
            ></v-list-item-title>
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
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue'

type MenuItem = {
  title: string
  icon: string
  action: () => void
}

type DataObj = {
  menuItems: MenuItem[]
}

export default Vue.extend({
  data(): DataObj {
    return {
      menuItems: [
        {
          title: 'Import Data',
          icon: 'mdi-application-import',
          action: () => {
            alert('Import Data') // TODO
          }
        },
        {
          title: 'Export Data',
          icon: 'mdi-application-export',
          action: () => {
            alert('Export Data') // TODO
          }
        },
        {
          title: 'Delete Data',
          icon: 'mdi-trash-can',
          action: () => {
            alert('Delete Data') // TODO
          }
        }
      ]
    }
  }
})
</script>

<style scoped="">
.v-list-item__icon:first-child {
  margin-right: 16px;
}
</style>
