'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const webpack = require('webpack');

const defaultFingerprintExtensions =
  require('broccoli-asset-rev/lib/default-options').extensions;

const environment = EmberApp.env();
const isProduction = environment === 'production' || environment === 'staging';
const minifyEnabled = isProduction;

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    storeConfigInMeta: false,
    babel: {
      sourceMaps: 'inline',
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
    minifyJS: {
      options: {
        exclude: ['runtimeconfig.js'],
      },
    },
    fingerprint: {
      enabled: true,
      exclude: ['runtimeconfig.js'],
      extensions: defaultFingerprintExtensions.concat(['svg']),
    },
    sassOptions: {
      includePaths: [
        'node_modules/bohemia',
        'node_modules/billboard.js/dist/',
        'node_modules/material-icons/css/',
        'node_modules/swagger-ui/dist/',
      ],
      // onlyIncluded: true,
      extension: 'sass',
      sourceMap: !isProduction,
      sourceMapEmbed: !isProduction,
    },
    cssModules: {
      intermediateOutputPath: 'app/styles/_modules.scss',
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
      },
    },
  });

  // Custom hacks to get a similar build in staging and production
  app.options.minifyCSS.enabled = minifyEnabled;
  app.options.minifyJS.enabled = minifyEnabled;
  app.options.fingerprint.enabled = minifyEnabled;

  return app.toTree();
};
