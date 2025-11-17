import type { StorybookConfig } from '@storybook/ember';

const config: StorybookConfig = {
  staticDirs: ['../dist'],
  stories: ['../app/components/**/*.stories.js'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
  ],

  framework: {
    name: '@storybook/ember',
    options: {},
  },

  core: {
    builder: '@storybook/builder-webpack5',
  },

  docs: {
    autodocs: 'tag',
  },

  previewBody: (body) => `
    ${body}
    <div id="ak-component-wormhole"></div>
    <script>
      document.body.classList.add('theme-dark');
    </script>
  `,
};

export default config;
