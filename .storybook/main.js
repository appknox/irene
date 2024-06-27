/* eslint-disable no-undef */

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
    polyfills: [],
  },
  previewBody: (body) => `
    ${body}
    <div id="ak-component-wormhole"></div>
    <script>
      document.body.classList.add('theme-dark');
    </script>
  `,
};
