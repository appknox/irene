const path = require('path');
const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line n/no-missing-require
const expressStaticGzip = require('express-static-gzip');

const staticDir = path.join(__dirname, 'dist');

const ENVs = [
  'IRENE_API_HOST',
  'IRENE_SHOW_LICENSE',
  'IRENE_ENABLE_HOTJAR',
  'IRENE_ENABLE_PENDO',
  'IRENE_ENABLE_CSB',
  'IRENE_ENABLE_MARKETPLACE',
  'IRENE_ENABLE_ROLLBAR',
  'IRENE_ICONIFY_API_HOST',
  'ENTERPRISE',
  'WHITELABEL_ENABLED',
  'WHITELABEL_NAME',
  'WHITELABEL_LOGO',
  'WHITELABEL_THEME',
  'WHITELABEL_FAVICON',
];

const app = express();
function getRuntimeConfig() {
  const content = {};
  for (const env of ENVs) {
    const value = process.env[env];
    if (value) {
      content[env] = value;
    }
  }
  return JSON.stringify(content);
}
app.use(morgan('tiny'));
app.get('/runtimeconfig.js', function (req, res) {
  const config = `var runtimeGlobalConfig=${getRuntimeConfig()};`;
  res.type('application/javascript');
  res.send(config);
});
app.use(
  expressStaticGzip(staticDir, {
    serveStatic: {
      index: ['index.html'],
    },
  })
);
app.use(function (req, res) {
  // lgtm [js/missing-rate-limiting]
  res.sendFile(path.join(staticDir, 'index.html'));
});
app.listen(4200, function () {
  console.log('server listening on port ' + 4200);
});
