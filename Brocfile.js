/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app'),
  assetRev = require('broccoli-asset-rev'),
  htmlmin = require('broccoli-htmlmin');

var app = new EmberApp({
  storeConfigInMeta: false
});

app.import('vendor/scripts/jquery.drawPieChart.js');

app.import('bower_components/socket.io-client/socket.io.js');
app.import('bower_components/ember-sockets/dist/ember-sockets.js');
app.import('bower_components/ember-uploader/dist/ember-uploader.js');
app.import('bower_components/animate.css/animate.min.css');

/*
 * No VNC includes
 */
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

var tree = app.toTree();

options = {
  quotes: true
};

if (app.env == 'production') {
  tree = assetRev(tree, {
    enabled: true,
    extensions: ['js', 'css', 'png', 'jpg', 'gif'],
    replaceExtensions: ['html', 'js', 'css'],
    prepend: '//du6tdhcax0qep.cloudfront.net/'
  });
}

if (app.env == 'staging') {
  tree = assetRev(tree, {
    enabled: true,
    extensions: ['js', 'css', 'png', 'jpg', 'gif'],
    replaceExtensions: ['html', 'js', 'css'],
    prepend: '//sherlock-assets-staging.s3-us-west-2.amazonaws.com/'
  });
}

tree = htmlmin(tree, options);

module.exports = tree;
