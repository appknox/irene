/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp({
  storeConfigInMeta: false
});

app.import('bower_components/socket.io-client/socket.io.js');
app.import('bower_components/ember-sockets/dist/ember-sockets.js');
app.import('bower_components/ember-uploader/dist/ember-uploader.js');
app.import('bower_components/animate.css/animate.min.css');

app.import('vendor/scripts/jquery.drawPieChart.js');

app.import('bower_components/no-vnc/include/util.js')
app.import('bower_components/no-vnc/include/webutil.js')
app.import('bower_components/no-vnc/include/base64.js')
app.import('bower_components/no-vnc/include/websock.js')
app.import('bower_components/no-vnc/include/des.js')
app.import('bower_components/no-vnc/include/keysymdef.js')
app.import('bower_components/no-vnc/include/keyboard.js')
app.import('bower_components/no-vnc/include/input.js')
app.import('bower_components/no-vnc/include/display.js')
app.import('bower_components/no-vnc/include/jsunzip.js')
app.import('bower_components/no-vnc/include/rfb.js')
app.import('bower_components/no-vnc/include/keysym.js')

module.exports = app.toTree();
