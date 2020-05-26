import colors from 'vuetify/lib/util/colors'

export default {
  mode: 'spa',
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  loading: { color: '#fff' },
  css: ['~/assets/common.css'],
  plugins: ['~/plugins/vuetifyColors.ts'],
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/vuetify'],
  modules: ['@nuxtjs/axios', '@nuxtjs/auth'],
  axios: {},
  auth: {
    redirect: {
      login: '/',
      logout: '/',
      callback: '/callback',
      home: '/'
    },
    strategies: {
      github: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET
      }
    }
  },
  vuetify: {
    theme: {
      themes: {
        light: {
          primary: colors.indigo,
          secondary: colors.teal,
          info: colors.grey.darken4
        }
      }
    }
  },
  srcDir: './src/'
}
