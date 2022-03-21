'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'no-partial': false, //partial is not recommended, we should deprecate this once the partial thing has been upgraded to component
    'no-curly-component-invocation': {
      allow: ['day-js'],
    },
  },
};
