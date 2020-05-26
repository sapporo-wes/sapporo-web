module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    './tsconfig.json',
    '@nuxtjs/eslint-config-typescript',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended'
  ],
  plugins: ['prettier'],
  rules: {}
}
