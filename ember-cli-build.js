/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
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
    }
  });

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
  app.import('bower_components/no-vnc/include/util.js');
  app.import('bower_components/no-vnc/include/webutil.js');
  app.import('bower_components/no-vnc/include/base64.js');
  app.import('bower_components/no-vnc/include/websock.js');
  app.import('bower_components/no-vnc/include/des.js');
  app.import('bower_components/no-vnc/include/keysymdef.js');
  app.import('bower_components/no-vnc/include/keyboard.js');
  app.import('bower_components/no-vnc/include/input.js');
  app.import('bower_components/no-vnc/include/display.js');
  app.import('bower_components/no-vnc/include/inflator.js');
  app.import('bower_components/no-vnc/include/rfb.js');
  app.import('bower_components/no-vnc/include/keysym.js');
  app.import("bower_components/pusher-websocket-iso/dist/web/pusher.js");
  app.import('bower_components/card/dist/card.js');
  app.import('bower_components/pace/pace.js');
  // app.import('bower_components/moment/moment.js');

  return app.toTree();
};
