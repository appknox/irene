/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

environment = EmberApp.env();
minifyEnabled = environment == "production" || environment == "staging";

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
    storeConfigInMeta: false,
    sassOptions: {
      extension: 'sass',
      includePaths: [
        'bower_components/bohemia/'
      ]
    },
    dotEnv: {
      clientAllowedKeys: ['AWS_BUCKET', 'AWS_REGION', 'WEBHOOK_URL'],
      path: {
        development: '.env.staging',
        test: '.env.staging',
        production: '.env',
        staging: '.env.staging'
      }
    },
    sourcemaps: {enabled: false}
  });

  // Custom hacks to get a similar build in staging and production
  app.options.minifyCSS.enabled = minifyEnabled;
  app.options.minifyJS.enabled = minifyEnabled;
  app.options.fingerprint.enabled = minifyEnabled

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
   * No VNC includes
   */
  app.import('bower_components/noVNC/core/base64.js');
  app.import('bower_components/noVNC/core/websock.js');
  app.import('bower_components/noVNC/core/des.js');
  app.import('bower_components/noVNC/core/input/keysymdef.js');
  app.import('bower_components/noVNC/core/input/xtscancodes.js');
  app.import('bower_components/noVNC/core/input/util.js');
  app.import('bower_components/noVNC/core/util.js');
  app.import('bower_components/noVNC/core/input/devices.js');
  app.import('bower_components/noVNC/core/display.js');
  app.import('bower_components/noVNC/core/inflator.js');
  app.import('bower_components/noVNC/core/rfb.js');
  app.import('bower_components/noVNC/core/input/keysym.js');

  /*
   * card includes
   */
  app.import('bower_components/card/dist/card.js');

  /*
   * including pace
   */
  app.import('bower_components/pace/pace.js');

  /*
   * including QRious
   */
   app.import('bower_components/qrious/dist/qrious.min.js');

   /*
    * including clipboard
    */
   app.import('bower_components/clipboard/dist/clipboard.min.js')

   /*
    * including devices.css
    */
    app.import('bower_components/devices.css/assets/devices.min.css')



  return app.toTree();
};
