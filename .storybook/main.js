/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
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
  previewBody: (body) => `
    ${body}
    <script>
      document.body.classList.add('theme-dark');
    </script>
  `,
};
