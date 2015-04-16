/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp({
  storeConfigInMeta: false
});

app.import('bower_components/socket.io-client/socket.io.js');
app.import('bower_components/ember-sockets/dist/ember-sockets.js');
app.import('bower_components/ember-uploader/dist/ember-uploader.js');
app.import('bower_components/animate.css/animate.min.css');

module.exports = app.toTree();
