module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  rules: {
    'no-console': 0,
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': ['off'],
    'unicorn/number-literal-case': 'off',
  },
}
