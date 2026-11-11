import { module, test } from 'qunit';

import matchesApiScanRequest from 'irene/utils/matches-api-scan-request';

const ENDPOINT = {
  method: 'POST',
  scheme: 'https',
  host: 'android.googleapis.com',
  port: '443',
  path: '/auth',
};

const finding = (url, method = 'POST', requestUrl = '') => ({
  url,
  request: { method, url: requestUrl },
});

module('Unit | Utility | matches-api-scan-request', function () {
  test.each(
    'it matches findings raised against the endpoint',
    [
      [finding('https://android.googleapis.com:443/auth')],
      [finding('https://android.googleapis.com/auth')],
      [finding('https://ANDROID.googleapis.com/auth?id=1%27')],
      [finding('', 'post', 'https://android.googleapis.com/auth')],
      [finding('https://android.googleapis.com/auth', '')],
    ],
    function (assert, [apiFinding]) {
      assert.true(matchesApiScanRequest(apiFinding, ENDPOINT));
    }
  );

  test.each(
    'it rejects findings of another endpoint',
    [
      [finding('https://android.googleapis.com/auth', 'GET')],
      [finding('http://android.googleapis.com/auth')],
      [finding('https://android.googleapis.com:8443/auth')],
      [finding('https://android.apis.google.com/auth')],
      [finding('https://android.googleapis.com/auth/token')],
      [finding('not a url')],
    ],
    function (assert, [apiFinding]) {
      assert.false(matchesApiScanRequest(apiFinding, ENDPOINT));
    }
  );

  test('it treats an empty port as the default port of the scheme', function (assert) {
    assert.true(
      matchesApiScanRequest(finding('http://vapi.appknox.io:80/'), {
        ...ENDPOINT,
        method: 'POST',
        scheme: 'http',
        host: 'vapi.appknox.io',
        port: '',
        path: '/',
      })
    );
  });
});
