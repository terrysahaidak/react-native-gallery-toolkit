const { peerDependencies } = require('./package.json');

module.exports = {
  root: true,
  extends: ['airbnb', 'prettier', 'prettier/react'],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react',
    'react-native',
    'import',
    '@typescript-eslint/eslint-plugin',
  ],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: true, peerDependencies: true },
    ],
    'import/prefer-default-export': 0,
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.tsx'] },
    ],
    // This rule doesn't play nice with Prettier
    'react/jsx-one-expression-per-line': 'off',
    // This rule doesn't play nice with Prettier
    'react/jsx-wrap-multilines': 'off',
    // Remove this rule because we only destructure props, but never state
    'react/destructuring-assignment': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/static-property-placement': 'off',
    'react/state-in-constructor': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-underscore-dangle': 0,
    'class-methods-use-this': 0,
    'no-param-reassign': 0,
    'no-use-before-define': [
      'error',
      { functions: false, classes: false },
    ],
    'import/no-unresolved': ["error", { ignore: Object.keys(peerDependencies) }]
    'no-void': 0,
    'import/extensions': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: [
          '.js',
          '.android.js',
          '.ios.js',
          '.jsx',
          '.android.jsx',
          '.ios.jsx',
          '.tsx',
          '.ts',
          '.android.tsx',
          '.android.ts',
          '.ios.tsx',
          '.ios.ts',
        ],
      },
    },
  },
};
