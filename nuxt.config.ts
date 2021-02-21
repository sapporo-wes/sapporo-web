import { NuxtConfig } from '@nuxt/types'
import colors from 'vuetify/lib/util/colors'

const config: NuxtConfig = {
  ssr: false,
  head: {
    title: 'Sapporo-web',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    // not working
    // script: [
    //   {
    //     type: 'text/javascript',
    //     src: 'https://www.ddbj.nig.ac.jp/assets/js/ddbj_common_framework.js',
    //     id: 'DDBJ_common_framework',
    //     async: true,
    //   },
    // ],
  },
  loading: { color: '#fff' },
  css: ['~/assets/common.css'],
  plugins: [
    '~/plugins/vuetifyColors.ts',
    { src: '~/plugins/localStorage.ts', ssr: false },
  ],
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/vuetify'],
  modules: ['@nuxtjs/axios', 'nuxt-webfontloader'],
  axios: {},
  webfontloader: {
    google: {
      families: ['Quicksand', 'Fira Code'],
    },
  },
  vuetify: {
    theme: {
      themes: {
        light: {
          primary: colors.indigo.darken4,
          secondary: colors.teal.darken4,
          info: colors.grey.darken4,
          error: colors.red.darken4,
        },
      },
    },
  },
  srcDir: './src/',
  server: {
    host: process.env.NUXT_HOST || '0.0.0.0',
    port: process.env.NUXT_PORT || 1121,
  },
  router: {
    base: process.env.SAPPORO_URL_PREFIX || '/',
  },
}

export default config
