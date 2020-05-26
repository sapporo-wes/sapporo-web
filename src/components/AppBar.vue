<template>
  <v-app-bar :color="this.$colors.indigo.darken2" fixed>
    <v-toolbar-title>
      <nuxt-link class="white--text text-decoration-none" to="/"
        >SAPPORO</nuxt-link
      >
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="white--text d-flex align-center">
      <div>
        Logged in as
      </div>
      <div class="ml-2">
        {{ this.$auth.$state.user.login }}
      </div>
      <v-avatar size="36" class="ml-4">
        <img :src="this.$auth.$state.user.avatar_url" />
      </v-avatar>
      <div class="ml-2">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon color="white">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list class="app-bar-height-margin">
            <v-list-item
              v-for="menuItem in this.menuItems"
              :key="menuItem.title"
              @click="menuItem.action"
            >
              <v-list-item-title class="info--text">{{
                menuItem.title
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue'

type menuItem = {
  title: string
  action: () => void
}

type dataObject = {
  menuItems: menuItem[]
}

export default Vue.extend({
  data(): dataObject {
    return {
      menuItems: [
        {
          title: 'Logout',
          action: () => {
            this.$auth.logout()
          }
        }
      ]
    }
  }
})
</script>
