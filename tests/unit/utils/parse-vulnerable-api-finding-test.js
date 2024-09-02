import {
  parseVulnerableApiFinding,
  isVulnerableApiFinding,
} from 'irene/utils/parse-vulnerable-api-finding';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Utility | parse-vulnerable-api-finding', function (hooks) {
  setupTest(hooks);

  const content1 =
    "p157-contacts.icloud.com:443/mm/sub: A response to one of our payload requests has taken too long compared to the baseline request. This could indicate a vulnerability to time-based Regex DoS attacks\nconfidence: LOW\nparam:\n  location: headers\n  method: POST\n  variables:\n  - X-Apple-I-Md-M\n  - Content-Length\n  - X-Apple-I-Locale\n  - Accept\n  - Accept-Language\n  - Connection\n  - X-Apple-I-Md\n  - Accept-Encoding\n  - User-Agent\n  - X-Apple-I-Timezone\n  - X-Apple-I-Md-Rinfo\n  - X-Apple-I-Client-Time\nrequest:\n  body: ''\n  headers:\n    Accept: '*/*'\n    Accept-Encoding: gzip, deflate, br\n    Accept-Language: en-US,en;q=0.9\n    Connection: keep-alive\n    Content-Length: '0'\n    Host: p157-caldav.icloud.com:443\n    User-Agent: iOS/16.7.5 (20H307) dataaccessd/1.0\n    X-Apple-I-Client-Time: '1111111111111111111111111111111112'\n    X-Apple-I-Locale: en_US\n    X-Apple-I-Md: AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==\n    X-Apple-I-Md-M: qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0\n    X-Apple-I-Md-Rinfo: '50660608'\n    X-Apple-I-Timezone: GMT+5:30\n  method: POST\n  params:\n    key: '16304401481'\n    token: b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268\n  url: https://p157-contacts.icloud.com:443/mm/sub\nresponse:\n  cookies: {}\n  headers:\n    Connection: keep-alive\n    Content-Length: '0'\n    Date: Mon, 15 Jul 2024 12:49:15 GMT\n    Server: AppleHttpServer/b866cf47a603\n    X-Apple-Edge-Response-Time: '0'\n    X-Apple-Filtered-At-Edge: 'true'\n    X-Apple-Request-UUID: f3dcbfe2-9417-43ff-9e2d-d09071707eb6\n    access-control-expose-headers: X-Apple-Request-UUID,Via\n    via: 631194250daa17e24277dea86cf30319:18042a2d519f8fe036a8b503c12ad658:usmes1\n    www-authenticate: X-MobileMe-AuthToken realm=\"MMCalDav\", Basic realm=\"MMCalDav\"\n    x-apple-user-partition: '157'\n  reason: Unauthorized\n  status_code: 401\n  text: ''\n  url: https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481\n  version: 11\nseverity: MEDIUM\n\n";

  const expectedObject1 = [
    {
      request: {
        body: "''",
        headers: {
          accept: "'*/*'",
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'en-US,en;q=0.9',
          connection: 'keep-alive',
          'content-length': "'0'",
          host: 'p157-caldav.icloud.com:443',
          'user-agent': 'iOS/16.7.5 (20H307) dataaccessd/1.0',
          'x-apple-i-client-time': "'1111111111111111111111111111111112'",
          'x-apple-i-locale': 'en_US',
          'x-apple-i-md': 'AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==',
          'x-apple-i-md-m':
            'qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0',
          'x-apple-i-md-rinfo': "'50660608'",
          'x-apple-i-timezone': 'GMT+5:30',
        },
        method: 'POST',
        params: {
          key: "'16304401481'",
          token:
            'b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268',
        },
        url: 'https://p157-contacts.icloud.com:443/mm/sub',
      },
      response: {
        headers: {
          connection: 'keep-alive',
          'content-length': "'0'",
          date: 'Mon, 15 Jul 2024 12:49:15 GMT',
          server: 'AppleHttpServer/b866cf47a603',
          'x-apple-edge-response-time': "'0'",
          'x-apple-filtered-at-edge': "'true'",
          'x-apple-request-uuid': 'f3dcbfe2-9417-43ff-9e2d-d09071707eb6',
          'access-control-expose-headers': 'X-Apple-Request-UUID,Via',
          via: '631194250daa17e24277dea86cf30319:18042a2d519f8fe036a8b503c12ad658:usmes1',
          'www-authenticate':
            'X-MobileMe-AuthToken realm="MMCalDav", Basic realm="MMCalDav"',
          'x-apple-user-partition': "'157'",
        },
        reason: 'Unauthorized',
        status_code: 401,
        text: '',
        url: 'https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481',
      },
      severity: 'MEDIUM',
      confidence: 'LOW',
      description:
        'A response to one of our payload requests has taken too long compared to the baseline request. This could indicate a vulnerability to time-based Regex DoS attacks',
    },
  ];

  const content2 =
    'https://token.safebrowsing.apple:443/api/v1/google.json: TRACE is enabled in the webserver configuration\nseverity: LOW\n\n\n';

  const expectedObject2 = [
    {
      request: {
        body: '',
        headers: {},
        method: '',
        params: {
          key: '',
          token: '',
        },
        url: 'https://token.safebrowsing.apple:443/api/v1/google.json',
      },
      response: {
        headers: {},
        reason: '',
        status_code: 0,
        text: '',
        url: '',
      },
      severity: 'LOW',
      confidence: '',
      description: 'TRACE is enabled in the webserver configuration',
    },
  ];

  const content3 =
    "p157-contacts.icloud.com:443/mm/sub: A response to one of our payload requests has taken too long compared to the baseline request. This could indicate a vulnerability to time-based SQL injection attacks\nconfidence: LOW\nparam:\n  location: headers\n  method: POST\n  variables:\n  - X-Apple-I-Md-M\n  - Content-Length\n  - X-Apple-I-Locale\n  - Accept\n  - Accept-Language\n  - Connection\n  - X-Apple-I-Md\n  - Accept-Encoding\n  - User-Agent\n  - X-Apple-I-Timezone\n  - X-Apple-I-Md-Rinfo\n  - Host\n  - X-Apple-I-Client-Time\nrequest:\n  body: ''\n  headers:\n    Accept: '*/*'\n    Accept-Encoding: ; OR '1'='1'\n    Accept-Language: en-US,en;q=0.9\n    Connection: keep-alive\n    Content-Length: '0'\n    Host: p157-caldav.icloud.com:443\n    User-Agent: iOS/16.7.5 (20H307) dataaccessd/1.0\n    X-Apple-I-Client-Time: '2024-07-15T09:07:13Z'\n    X-Apple-I-Locale: en_US\n    X-Apple-I-Md: AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==\n    X-Apple-I-Md-M: qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0\n    X-Apple-I-Md-Rinfo: '50660608'\n    X-Apple-I-Timezone: GMT+5:30\n  method: POST\n  params:\n    key: '16304401481'\n    token: b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268\n  url: https://p157-contacts.icloud.com:443/mm/sub\nresponse:\n  cookies: {}\n  headers:\n    Connection: keep-alive\n    Content-Length: '0'\n    Date: Mon, 15 Jul 2024 12:50:17 GMT\n    Server: AppleHttpServer/b866cf47a603\n    X-Apple-Edge-Response-Time: '0'\n    X-Apple-Filtered-At-Edge: 'true'\n    X-Apple-Request-UUID: c411e3b6-c70a-4b50-acd5-b98c31521249\n    access-control-expose-headers: X-Apple-Request-UUID,Via\n    via: 631194250daa17e24277dea86cf30319:02caeb0e04ee373e250b945a1f576f08:usdal2\n    www-authenticate: X-MobileMe-AuthToken realm=\"MMCalDav\", Basic realm=\"MMCalDav\"\n    x-apple-user-partition: '157'\n  reason: Unauthorized\n  status_code: 401\n  text: ''\n  url: https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481\n  version: 11\nseverity: MEDIUM\n\nconfidence: LOW\nparam:\n  location: params\n  method: POST\n  variables:\n  - token\n  - key\nrequest:\n  body: ''\n  headers:\n    Accept: '*/*'\n    Accept-Encoding: gzip, deflate, br\n    Accept-Language: en-US,en;q=0.9\n    Connection: keep-alive\n    Content-Length: '0'\n    Host: p157-caldav.icloud.com:443\n    User-Agent: iOS/16.7.5 (20H307) dataaccessd/1.0\n    X-Apple-I-Client-Time: '2024-07-15T09:07:13Z'\n    X-Apple-I-Locale: en_US\n    X-Apple-I-Md: AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==\n    X-Apple-I-Md-M: qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0\n    X-Apple-I-Md-Rinfo: '50660608'\n    X-Apple-I-Timezone: GMT+5:30\n  method: POST\n  params:\n    key: '16304401481'\n    token: ; OR '1'='1'\n  url: https://p157-contacts.icloud.com:443/mm/sub\nresponse:\n  cookies: {}\n  headers:\n    Connection: keep-alive\n    Content-Length: '0'\n    Date: Mon, 15 Jul 2024 12:50:18 GMT\n    Server: AppleHttpServer/b866cf47a603\n    X-Apple-Edge-Response-Time: '0'\n    X-Apple-Filtered-At-Edge: 'true'\n    X-Apple-Request-UUID: 05b1ac99-ee33-44ba-aa1d-f52499fdcd88\n    access-control-expose-headers: X-Apple-Request-UUID,Via\n    via: 631194250daa17e24277dea86cf30319:4253a6fbce6fc9cade45c5ab633577a5:usmes1\n    www-authenticate: X-MobileMe-AuthToken realm=\"MMCalDav\", Basic realm=\"MMCalDav\"\n    x-apple-user-partition: '157'\n  reason: Unauthorized\n  status_code: 401\n  text: ''\n  url: https://p157-contacts.icloud.com:443/mm/sub?token=%3B+OR+%271%27%3D%271%27&key=16304401481\n  version: 11\nseverity: MEDIUM\n\n\n";

  const expectedObject3 = [
    {
      request: {
        body: "''",
        headers: {
          accept: "'*/*'",
          'accept-encoding': "; OR '1'='1'",
          'accept-language': 'en-US,en;q=0.9',
          connection: 'keep-alive',
          'content-length': "'0'",
          host: 'p157-caldav.icloud.com:443',
          'user-agent': 'iOS/16.7.5 (20H307) dataaccessd/1.0',
          'x-apple-i-client-time': "'2024-07-15T09:07:13Z'",
          'x-apple-i-locale': 'en_US',
          'x-apple-i-md': 'AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==',
          'x-apple-i-md-m':
            'qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0',
          'x-apple-i-md-rinfo': "'50660608'",
          'x-apple-i-timezone': 'GMT+5:30',
        },
        method: 'POST',
        params: {
          key: "'16304401481'",
          token:
            'b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268',
        },
        url: 'https://p157-contacts.icloud.com:443/mm/sub',
      },
      response: {
        headers: {
          connection: 'keep-alive',
          'content-length': "'0'",
          date: 'Mon, 15 Jul 2024 12:50:17 GMT',
          server: 'AppleHttpServer/b866cf47a603',
          'x-apple-edge-response-time': "'0'",
          'x-apple-filtered-at-edge': "'true'",
          'x-apple-request-uuid': 'c411e3b6-c70a-4b50-acd5-b98c31521249',
          'access-control-expose-headers': 'X-Apple-Request-UUID,Via',
          via: '631194250daa17e24277dea86cf30319:02caeb0e04ee373e250b945a1f576f08:usdal2',
          'www-authenticate':
            'X-MobileMe-AuthToken realm="MMCalDav", Basic realm="MMCalDav"',
          'x-apple-user-partition': "'157'",
        },
        reason: 'Unauthorized',
        status_code: 401,
        text: '',
        url: 'https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481',
      },
      severity: 'MEDIUM',
      confidence: 'LOW',
      description:
        'A response to one of our payload requests has taken too long compared to the baseline request. This could indicate a vulnerability to time-based SQL injection attacks',
    },
    {
      request: {
        body: "''",
        headers: {
          accept: "'*/*'",
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'en-US,en;q=0.9',
          connection: 'keep-alive',
          'content-length': "'0'",
          host: 'p157-caldav.icloud.com:443',
          'user-agent': 'iOS/16.7.5 (20H307) dataaccessd/1.0',
          'x-apple-i-client-time': "'2024-07-15T09:07:13Z'",
          'x-apple-i-locale': 'en_US',
          'x-apple-i-md': 'AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==',
          'x-apple-i-md-m':
            'qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0',
          'x-apple-i-md-rinfo': "'50660608'",
          'x-apple-i-timezone': 'GMT+5:30',
        },
        method: 'POST',
        params: {
          key: "'16304401481'",
          token: "; OR '1'='1'",
        },
        url: 'https://p157-contacts.icloud.com:443/mm/sub',
      },
      response: {
        headers: {
          connection: 'keep-alive',
          'content-length': "'0'",
          date: 'Mon, 15 Jul 2024 12:50:18 GMT',
          server: 'AppleHttpServer/b866cf47a603',
          'x-apple-edge-response-time': "'0'",
          'x-apple-filtered-at-edge': "'true'",
          'x-apple-request-uuid': '05b1ac99-ee33-44ba-aa1d-f52499fdcd88',
          'access-control-expose-headers': 'X-Apple-Request-UUID,Via',
          via: '631194250daa17e24277dea86cf30319:4253a6fbce6fc9cade45c5ab633577a5:usmes1',
          'www-authenticate':
            'X-MobileMe-AuthToken realm="MMCalDav", Basic realm="MMCalDav"',
          'x-apple-user-partition': "'157'",
        },
        reason: 'Unauthorized',
        status_code: 401,
        text: '',
        url: 'https://p157-contacts.icloud.com:443/mm/sub?token=%3B+OR+%271%27%3D%271%27&key=16304401481',
      },
      severity: 'MEDIUM',
      confidence: 'LOW',
      description: '',
    },
  ];

  const vulnerableApiFindings = [
    { content: content1, expectedObject: expectedObject1 },
    { content: content2, expectedObject: expectedObject2 },
    { content: content3, expectedObject: expectedObject3 },
  ];

  test.each(
    'it correctly parses a valid vulnerability block including all VulnerableApiRequest fields',
    vulnerableApiFindings,
    function (assert, vulnerableApiFinding) {
      const results = parseVulnerableApiFinding(vulnerableApiFinding.content);

      assert.strictEqual(
        results.length,
        vulnerableApiFinding.expectedObject.length
      );

      vulnerableApiFinding.expectedObject.forEach((finding, index) => {
        assert.propEqual(results[index], finding);
      });
    }
  );

  test('should return true if content contains vulnerability indicators', (assert) => {
    const contentWithVulnerability = `
      severity: high
      confidence: medium
      method: GET
    `;

    const result = isVulnerableApiFinding(contentWithVulnerability);

    assert.true(result);
  });

  test('should return false if content contains vulnerability indicators', (assert) => {
    const contentWithVulnerability =
      'description: This is just a regular log entry.';

    const result = isVulnerableApiFinding(contentWithVulnerability);

    assert.false(result);
  });
});
