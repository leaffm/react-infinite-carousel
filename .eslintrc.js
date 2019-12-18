module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  extends: [
    'airbnb',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'prettier/react',
    'prettier/standard',
  ],
  plugins: ['prettier'],
  rules: {
    'jsx-a11y/href-no-hash': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/prefer-stateless-function': [1, { ignorePureComponents: true }],
    'function-paren-newline': ['error', 'consistent'],
    'arrow-body-style': [1, 'as-needed'],
    'no-unused-vars': ['error', { vars: 'all', args: 'all', ignoreRestSiblings: false }],
    'prefer-destructuring': ['error', { object: true, array: true }],
    'react/forbid-prop-types': ['error', { forbid: [] }],
    'react/prop-types': 1,
    'max-len': [
      2,
      150,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        tabWidth: 2,
      },
    ],
    'no-underscore-dangle': ['error', { allow: ['__PRELOADED_STATE__'] }],
    'no-unused-expressions': 1,
    'react/no-unused-prop-types': 1,
    'no-unneeded-ternary': 2,
    'import/prefer-default-export': 1,
    'react/destructuring-assignment': [1, 'always'],
    'linebreak-style': 1,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};
