require('@uniswap/eslint-config/load')

module.exports = {
  extends: ['@uniswap/eslint-config/node'],
  rules: {
    'import/no-unused-modules': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
  },
}
