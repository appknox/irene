'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');
const webpack = require('webpack');

const defaultFingerprintExtensions =
  require('broccoli-asset-rev/lib/default-options').extensions;

const environment = EmberApp.env();
const isProduction = environment === 'production' || environment === 'staging';
const minifyEnabled = isProduction;

// swagger-ui's own package plus every transitive dependency that needs to
// land in the same enforced cache group (see the swaggerUi cache group
// below) - kept as a list instead of one long regex literal to stay under
// regex-complexity lint limits.
const swaggerUiPackages = [
  'swagger-ui',
  'swagger-client',
  'swagger-ui-react',
  'react',
  'react-dom',
  'react-redux',
  'redux',
  'immutable',
  'react-copy-to-clipboard',
  'copy-to-clipboard',
  'toggle-selection',
  'react-syntax-highlighter',
  'react-immutable-proptypes',
  'react-immutable-pure-component',
  'react-inspector',
  'react-debounce-input',
  'reselect',
  'remarkable',
  '@tanstack',
];
const swaggerUiTest = new RegExp(
  String.raw`[\\/]node_modules[\\/](${swaggerUiPackages.join('|')})[\\/]`
);

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    storeConfigInMeta: false,
    babel: {
      sourceMaps: 'inline',
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
        // Required for ember-auto-import to code-split dynamic import()
        // calls into separate, lazily-loaded files instead of inlining
        // them into the main app bundle. See ember-auto-import's README
        // ("Dynamic Import").
        require.resolve('ember-auto-import/babel-plugin'),
      ],
    },
    minifyJS: {
      options: {
        exclude: ['runtimeconfig.js'],
      },
    },
    fingerprint: {
      enabled: true,
      // public-api-docs.css is loaded at runtime via a hardcoded path
      // (see irene/utils/load-public-api-docs-styles), so it can't be fingerprinted.
      exclude: ['runtimeconfig.js', 'public-api-docs.css'],
      extensions: defaultFingerprintExtensions.concat(['svg']),
    },
    sassOptions: {
      includePaths: [
        'node_modules/swagger-ui/dist/',
        'node_modules/iconify-icon',
      ],
      sourceMap: !isProduction,
      sourceMapEmbed: !isProduction,
    },
    // Compile app/styles/public-api-docs.scss to its own CSS file instead of
    // folding it into irene.css, so swagger-ui's styles aren't render-blocking
    // on every page - only public-api-docs lazy-loads it (see
    // irene/utils/load-public-api-docs-styles). Must be set here, as part of
    // the EmberApp constructor options - ember-cli-sass reads outputPaths
    // during construction, so mutating app.options afterward has no effect.
    outputPaths: {
      app: {
        css: {
          app: '/assets/irene.css',
          'public-api-docs': '/assets/public-api-docs.css',
        },
      },
    },
    cssModules: {
      intermediateOutputPath: 'app/styles/app.scss',
      extension: 'scss',
    },
    autoprefixer: {
      enabled: true,
      cascade: true,
      sourcemap: !isProduction,
    },
    dotEnv: {
      clientAllowedKeys: ['AWS_BUCKET', 'AWS_REGION', 'WEBHOOK_URL'],
      path: {
        development: '.env.staging',
        test: '.env.staging',
        production: '.env',
        staging: '.env.staging',
        whitelabel: '.env',
      },
    },
    sourcemaps: {
      enabled: true,
    },
    'ember-date-components': {
      includeCSS: false,
    },
    autoImport: {
      webpack: {
        // extra webpack configuration goes here
        node: {
          global: true,
        },
        plugins: [
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
          }),
        ],
        resolve: {
          fallback: {
            fs: false,
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
          },
        },

        optimization: {
          splitChunks: {
            chunks: 'all',
            maxSize: 20000000, // 20 MB
            cacheGroups: {
              echarts: {
                test: /[\\/]node_modules[\\/]echarts/,
                name: 'echarts',
                enforce: true,
              },
              fakerJs: {
                test: /[\\/]node_modules[\\/]@faker-js[\\/]/,
                name: 'faker-js',
                enforce: true,
              },
              // swagger-ui is only reachable via the dynamic import() in
              // irene/utils/load-swagger-ui. Without its own named/enforced
              // cache group (same pattern as echarts above), it and its
              // dependencies fall into webpack's default vendor chunking,
              // which - with this app's custom splitChunks config - ends up
              // producing a chunk that's still script-tagged eagerly in
              // index.html instead of staying lazy-loaded on demand.
              swaggerUi: {
                test: swaggerUiTest,
                name: 'swagger-ui',
                enforce: true,
              },
            },
          },
        },
      },
    },
  });

  // Custom hacks to get a similar build in staging and production
  app.options.minifyCSS.enabled = minifyEnabled;
  app.options.minifyJS.enabled = minifyEnabled;
  app.options.fingerprint.enabled = minifyEnabled;

  // *.stories.js files (app/components/**) are only consumed by Storybook's
  // own build, which globs them directly from source (see .storybook/main.js)
  // - they don't need to go through ember build at all. Left in, they're
  // still part of the app tree ember-auto-import scans, and a couple of them
  // statically import @faker-js/faker, which alone pulls a ~4.3MB chunk into
  // every production page load for a dependency the real app never uses.
  app.trees.app = new Funnel(app.trees.app, {
    exclude: ['**/*.stories.js'],
  });

  return app.toTree();
};
