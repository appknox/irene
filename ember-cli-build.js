'use strict';
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var environment = EmberApp.env();
var minifyEnabled = environment === "production" || environment === "staging" || environment === "whitelabel";

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    storeConfigInMeta: false,
    minifyJS: {
      options: {
        exclude: ['runtimeconfig.js']
      }
    },
    fingerprint: {
      exclude: ['runtimeconfig.js']
    },
    sassOptions: {
      implementation: require("node-sass"),
      extension: 'sass',
      includePaths: [
        'bower_components/bohemia/'
      ]
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
    sourcemaps: { enabled: false },
    'ember-cli-babel': {
      includePolyfill: true
    },
    'ember-date-components': {
      'includeCSS': false
    }
  });

  // Custom hacks to get a similar build in staging and production
  app.options.minifyCSS.enabled = minifyEnabled;
  app.options.minifyJS.enabled = minifyEnabled;
  app.options.fingerprint.enabled = minifyEnabled;

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  /*
   * card includes
   */
  app.import('bower_components/card/dist/card.js');
  /*
   * including clipboard
   */
  app.import('bower_components/clipboard/dist/clipboard.min.js');

  app.import('node_modules/billboard.js/dist/billboard.css');


  /*
   * including chart.js
   */
  app.import('bower_components/chart.js/dist/Chart.js');

  return app.toTree();
};
