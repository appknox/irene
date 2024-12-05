'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'no-curly-component-invocation': { allow: ['day-js'] },
    // TODO: Remove these rules later on
    'no-at-ember-render-modifiers': 'off',
    'no-builtin-form-components': 'off',
    'no-autofocus-attribute': 'off',
  },
};
