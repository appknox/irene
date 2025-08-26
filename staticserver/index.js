const path = require('path');
const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line n/no-missing-require
const expressStaticGzip = require('express-static-gzip');
const { createProxyMiddleware } = require('http-proxy-middleware');

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

// Proxy iconify requests to iconify-api server
// Iconify API Proxy Configuration
const iconifyPort = process.env.ICONIFY_PORT || 3000;
const iconifyTarget = `http://localhost:${iconifyPort}`;

// Iconify SVG routes - /prefix/icon.svg, /prefix:name.svg, /prefix-name.svg
app.use(
  '/icons',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
    pathRewrite: { '^/icons': '' },
  })
);

// Iconify Collections and metadata
app.use(
  '/collections',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.use(
  '/collection',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

// Iconify JSON data - /prefix.json, /prefix/icons.json
app.get(
  '/:prefix.json',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.get(
  '/:prefix/icons.json',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

// Iconify JS data - /prefix.js, /prefix/icons.js
app.get(
  '/:prefix.js',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.get(
  '/:prefix/icons.js',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

// Iconify CSS - /prefix.css
app.get(
  '/:prefix.css',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

// Iconify Search and Lists (if enabled)
app.use(
  '/search',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.use(
  '/keywords',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.use(
  '/list-icons',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.use(
  '/list-icons-categorized',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

// Iconify Utility endpoints
app.use(
  '/last-modified',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.use(
  '/update',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.use(
  '/version',
  createProxyMiddleware({
    target: iconifyTarget,
    changeOrigin: true,
  })
);

app.listen(4200, function () {
  console.log('server listening on port ' + 4200);
});
