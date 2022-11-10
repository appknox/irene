/* eslint-disable no-undef */
const namedBlockPolyfill = require('ember-named-blocks-polyfill/lib/named-blocks-polyfill-plugin');

module.exports = {
  stories: ['../app/components/**/*.stories.js'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  features: {
    postcss: false,
  },
  framework: '@storybook/ember',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  emberOptions: {
    polyfills: [namedBlockPolyfill],
  },
};
