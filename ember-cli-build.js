'use strict';
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var environment = EmberApp.env();
var minifyEnabled = environment === "production" || environment === "staging";

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    storeConfigInMeta: false,
    babel: {
      sourceMaps: 'inline'
    },
    minifyJS: {
      options: {
        exclude: ['runtimeconfig.js']
      }
    },
    fingerprint: {
      exclude: ['runtimeconfig.js']
    },
    sassOptions: {
      includePaths: [
        'node_modules',
      ],
      implementation: require("node-sass"),
      extension: 'sass'
    },
    cssModules: {
      intermediateOutputPath: 'app/styles/_modules.scss'
    },
    dotEnv: {
      clientAllowedKeys: ['AWS_BUCKET', 'AWS_REGION', 'WEBHOOK_URL'],
      path: {
        development: '.env.staging',
        test: '.env.staging',
        production: '.env',
        staging: '.env.staging',
        whitelabel: '.env'
      }
    },
    sourcemaps: {
      enabled: true
    },
    'ember-date-components': {
      'includeCSS': false
    }
  });

  // Custom hacks to get a similar build in staging and production
  app.options.minifyCSS.enabled = minifyEnabled;
  app.options.minifyJS.enabled = minifyEnabled;
  app.options.fingerprint.enabled = minifyEnabled;

  return app.toTree();
};
