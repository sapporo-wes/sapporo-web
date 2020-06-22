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
  plugins: [
    '~/plugins/vuetifyColors.ts',
    { src: '~/plugins/localStorage.ts', ssr: false }
  ],
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/vuetify'],
  modules: ['@nuxtjs/axios', 'nuxt-webfontloader'],
  axios: {},
  webfontloader: {
    google: {
      families: ['Quicksand']
    }
  },
  vuetify: {
    theme: {
      themes: {
        light: {
          primary: colors.indigo.darken4,
          secondary: colors.teal,
          info: colors.grey.darken4
        }
      }
    }
  },
  srcDir: './src/'
}
