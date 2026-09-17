'use strict';

const https = require('https');
const http = require('http');

module.exports = function (app) {
  // Local development proxy to fetch presigned S3 / DigitalOcean Spaces logs
  // without CORS blocking from localhost:4200.
  app.get('/_dev_proxy_log', (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    client
      .get(targetUrl, (upstreamRes) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        upstreamRes.pipe(res);
      })
      .on('error', (err) => {
        res.status(500).send(err.message);
      });
  });
};
