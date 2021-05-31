'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
  env: {
    browser: true
  },
  rules: {
    "ember/avoid-leaking-state-in-ember-objects": 0,
    "ember/no-observers": 0,
    "ember/no-restricted-resolver-tests": 0,
    "ember/no-new-mixins": 0,
    "ember/require-return-from-computed": 0,
    "ember/no-unnecessary-route-path-option": 0,
    "ember/no-arrow-function-computed-properties": 0,
    "ember/no-get": 0,
    "ember/no-jquery": 0,
    "ember/use-ember-data-rfc-395-imports": 0,
    "ember/no-mixins": 0,
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.prettierrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
      }
    },
    {
      files: [
        'staticserver/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
        'node/no-missing-require': 'off',
      }
    }
  ]
};
