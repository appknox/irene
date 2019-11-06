module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  rules: {
    "ember/avoid-leaking-state-in-ember-objects": 0,
    "ember/no-observers": 0,
    "ember/no-restricted-resolver-tests": 0,
    "ember/no-new-mixins": 0,
    "ember/require-return-from-computed": 0,
    "ember/no-unnecessary-route-path-option": 0,
    "ember/no-arrow-function-computed-properties": 0,
    "ember/no-unnecessary-route-path-option": 0,
  },
  overrides: [
    // node files
    {
      files: [
        'testem.js',
        'ember-cli-build.js',
        'config/**/*.js',
        'lib/*/index.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    },

    // test files
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      env: {
        embertest: true
      }
    }
  ]
};
