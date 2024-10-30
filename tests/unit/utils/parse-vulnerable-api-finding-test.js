import {
  parseVulnerableApiFinding,
  isVulnerableApiFinding,
} from 'irene/utils/parse-vulnerable-api-finding';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Utility | parse-vulnerable-api-finding', function (hooks) {
  setupTest(hooks);

  const content1 =
    "p157-contacts.icloud.com:443/mm/sub: A response to one of our payload requests has taken too long compared to the baseline request. This could indicate a vulnerability to time-based Regex DoS attacks\nconfidence: LOW\nparam:\n  location: headers\n  method: POST\n  variables:\n  - X-Apple-I-Md-M\n  - Content-Length\n  - X-Apple-I-Locale\n  - Accept\n  - Accept-Language\n  - Connection\n  - X-Apple-I-Md\n  - Accept-Encoding\n  - User-Agent\n  - X-Apple-I-Timezone\n  - X-Apple-I-Md-Rinfo\n  - X-Apple-I-Client-Time\nrequest:\n  body: ''\n  headers:\n    Accept: '*/*'\n    Accept-Encoding: gzip, deflate, br\n    Accept-Language: en-US,en;q=0.9\n    Connection: keep-alive\n    Content-Length: '0'\n    Host: p157-caldav.icloud.com:443\n    User-Agent: iOS/16.7.5 (20H307) dataaccessd/1.0\n    X-Apple-I-Client-Time: '1111111111111111111111111111111112'\n    X-Apple-I-Locale: en_US\n    X-Apple-I-Md: AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==\n    X-Apple-I-Md-M: qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0\n    X-Apple-I-Md-Rinfo: '50660608'\n    X-Apple-I-Timezone: GMT+5:30\n  method: POST\n  params:\n    key: '16304401481'\n    token: b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268\n  url: https://p157-contacts.icloud.com:443/mm/sub\nresponse:\n  cookies:\n    JSESSIONID: 0000gfnsEirGQB2UzBDCcDys4Un:1cca51vsg\n    VSLEGFIA: 022f6c2a0b-ee5b-4b5HFOjCLRz0fkRYfGDWsskj3PxhW1FT4PNCd2AqIl_uBPL0m1psk_DSBX0qcKCSGO7bY\n    WC_PERSISTENT: 6KqdTAXHThll4Ll8fMLSnpkpDZGTH2stmRKqWcNQfMk%3D%3B2024-07-31+16%3A19%3A53.785_1722457193785-8500_0\n    __cf_bm: irVbX8KLSRbQwNnUZzx8.wKUryCpolObw3OtCxlBWRA-1722457193-1.0.1.1-2fvHPIjkGdPENjQnGpZO4HVGW2RCipjQ5ogdRhtyTnw.JF8skFeoJhkWAa53BWdd.U850VGe.MACd6K9tTWf9A\n    src: app\n  \n  headers:\n    Connection: keep-alive\n    Content-Length: '0'\n    Date: Mon, 15 Jul 2024 12:49:15 GMT\n    Server: AppleHttpServer/b866cf47a603\n    X-Apple-Edge-Response-Time: '0'\n    X-Apple-Filtered-At-Edge: 'true'\n    X-Apple-Request-UUID: f3dcbfe2-9417-43ff-9e2d-d09071707eb6\n    access-control-expose-headers: X-Apple-Request-UUID,Via\n    via: 631194250daa17e24277dea86cf30319:18042a2d519f8fe036a8b503c12ad658:usmes1\n    www-authenticate: X-MobileMe-AuthToken realm=\"MMCalDav\", Basic realm=\"MMCalDav\"\n    x-apple-user-partition: '157'\n  reason: Unauthorized\n  status_code: 401\n  text: '{\"storeConf\":[{\"assortment_enable\":\"true\"}]}'\n  url: https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481\n  version: 11\nseverity: MEDIUM\n\n";

  const expectedObject1 = [
    {
      request: {
        body: "''",
        cookies: {},
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
        cookies: {
          __cf_bm:
            'irVbX8KLSRbQwNnUZzx8.wKUryCpolObw3OtCxlBWRA-1722457193-1.0.1.1-2fvHPIjkGdPENjQnGpZO4HVGW2RCipjQ5ogdRhtyTnw.JF8skFeoJhkWAa53BWdd.U850VGe.MACd6K9tTWf9A',
          jsessionid: '0000gfnsEirGQB2UzBDCcDys4Un:1cca51vsg',
          src: 'app',
          vslegfia:
            '022f6c2a0b-ee5b-4b5HFOjCLRz0fkRYfGDWsskj3PxhW1FT4PNCd2AqIl_uBPL0m1psk_DSBX0qcKCSGO7bY',
          wc_persistent:
            '6KqdTAXHThll4Ll8fMLSnpkpDZGTH2stmRKqWcNQfMk%3D%3B2024-07-31+16%3A19%3A53.785_1722457193785-8500_0',
        },
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
        text: '\'{"storeConf":[{"assortment_enable":"true"}]}\'',
        url: 'https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481',
      },
      severity: 'MEDIUM',
      confidence: 'LOW',
      url: 'p157-contacts.icloud.com:443/mm/sub',
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
        cookies: {},
        headers: {},
        method: '',
        params: {},
        url: '',
      },
      response: {
        headers: {},
        cookies: {},
        reason: '',
        status_code: 0,
        text: '',
        url: '',
      },
      severity: 'LOW',
      confidence: '',
      url: 'https://token.safebrowsing.apple:443/api/v1/google.json',
      description: 'TRACE is enabled in the webserver configuration',
    },
  ];

  const content3 =
    "p157-contacts.icloud.com:443/mm/sub: A response to one of our payload requests has taken too long compared to the baseline request. This could indicate a vulnerability to time-based SQL injection attacks\nconfidence: LOW\nparam:\n  location: headers\n  method: POST\n  variables:\n  - X-Apple-I-Md-M\n  - Content-Length\n  - X-Apple-I-Locale\n  - Accept\n  - Accept-Language\n  - Connection\n  - X-Apple-I-Md\n  - Accept-Encoding\n  - User-Agent\n  - X-Apple-I-Timezone\n  - X-Apple-I-Md-Rinfo\n  - Host\n  - X-Apple-I-Client-Time\nrequest:\n  body: '{\"operationName\": \"GetAdhocTasks\", \"variables\": {\"driverId\": 3, \"startTime\": \"2024-09-02 14:00:00\", \"endTime\": \"2024-09-03 00:00:00\"}, \"query\": \"query GetAdhocTasks($driverId: Int, $endTime: String, $startTime: String) {\\n  adhocTasks(driverId: $driverId, endTime: $endTime, startTime: $startTime) {\\n    adhoctaskId\\n    driverId\\n    note\\n    startTime\\n    endDeadline\\n    issueType\\n    delayedTask\\n    __typename\\n  }\\n}\"}'\n  headers:\n    Accept: '*/*'\n    Accept-Encoding: ; OR '1'='1'\n    Accept-Language: en-US,en;q=0.9\n    Connection: keep-alive\n    Content-Length: '0'\n    Host: p157-caldav.icloud.com:443\n    User-Agent: iOS/16.7.5 (20H307) dataaccessd/1.0\n    X-Apple-I-Client-Time: '2024-07-15T09:07:13Z'\n    X-Apple-I-Locale: en_US\n    X-Apple-I-Md: AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==\n    X-Apple-I-Md-M: qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0\n    X-Apple-I-Md-Rinfo: '50660608'\n    X-Apple-I-Timezone: GMT+5:30\n  method: POST\n  params:\n    catalogId: '10054'\n    langId: '-1'\n    name: assortment_enable\n    responseFormat: json\n    src: app\n  url: https://qa2.hdsupplysolutions.com:443/wcs/resources/store/10051/hdsstore/storeconf\n  url: https://p157-contacts.icloud.com:443/mm/sub\nresponse:\n  cookies: {}\n  headers:\n    Connection: keep-alive\n    Content-Length: '0'\n    Date: Mon, 15 Jul 2024 12:50:17 GMT\n    Server: AppleHttpServer/b866cf47a603\n    X-Apple-Edge-Response-Time: '0'\n    X-Apple-Filtered-At-Edge: 'true'\n    X-Apple-Request-UUID: c411e3b6-c70a-4b50-acd5-b98c31521249\n    access-control-expose-headers: X-Apple-Request-UUID,Via\n    via: 631194250daa17e24277dea86cf30319:02caeb0e04ee373e250b945a1f576f08:usdal2\n    www-authenticate: X-MobileMe-AuthToken realm=\"MMCalDav\", Basic realm=\"MMCalDav\"\n    x-apple-user-partition: '157'\n  reason: Unauthorized\n  status_code: 401\n  text: ''\n  url: https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481\n  version: 11\nseverity: MEDIUM\n\nconfidence: LOW\nparam:\n  location: params\n  method: POST\n  variables:\n  - token\n  - key\nrequest:\n  body: ''\n  headers:\n    Accept: '*/*'\n    Accept-Encoding: gzip, deflate, br\n    Accept-Language: en-US,en;q=0.9\n    Connection: keep-alive\n    Content-Length: '0'\n    Host: p157-caldav.icloud.com:443\n    User-Agent: iOS/16.7.5 (20H307) dataaccessd/1.0\n    X-Apple-I-Client-Time: '2024-07-15T09:07:13Z'\n    X-Apple-I-Locale: en_US\n    X-Apple-I-Md: AAAABQAAABD+t/oZrRyr0dQagkbgUyI3AAAAAw==\n    X-Apple-I-Md-M: qKirfmb8fGttUzAtNOscrjefNSH3JW09VgFOjsxKbHYZeoFsqnHcTScIa6zrbXzkCyinChfXXcQZaME0\n    X-Apple-I-Md-Rinfo: '50660608'\n    X-Apple-I-Timezone: GMT+5:30\n  method: POST\n  params:\n    key: '16304401481'\n    token: ; OR '1'='1'\n  url: https://p157-contacts.icloud.com:443/mm/sub\nresponse:\n  cookies: {}\n  headers:\n    Connection: keep-alive\n    Content-Length: '0'\n    Date: Mon, 15 Jul 2024 12:50:18 GMT\n    Server: AppleHttpServer/b866cf47a603\n    X-Apple-Edge-Response-Time: '0'\n    X-Apple-Filtered-At-Edge: 'true'\n    X-Apple-Request-UUID: 05b1ac99-ee33-44ba-aa1d-f52499fdcd88\n    access-control-expose-headers: X-Apple-Request-UUID,Via\n    via: 631194250daa17e24277dea86cf30319:4253a6fbce6fc9cade45c5ab633577a5:usmes1\n    www-authenticate: X-MobileMe-AuthToken realm=\"MMCalDav\", Basic realm=\"MMCalDav\"\n    x-apple-user-partition: '157'\n  reason: Unauthorized\n  status_code: 401\n  text: ''\n  url: https://p157-contacts.icloud.com:443/mm/sub?token=%3B+OR+%271%27%3D%271%27&key=16304401481\n  version: 11\nseverity: MEDIUM\n\n\n";

  const expectedObject3 = [
    {
      request: {
        body: '\'{"operationName": "GetAdhocTasks", "variables": {"driverId": 3, "startTime": "2024-09-02 14:00:00", "endTime": "2024-09-03 00:00:00"}, "query": "query GetAdhocTasks($driverId: Int, $endTime: String, $startTime: String) {\\n  adhocTasks(driverId: $driverId, endTime: $endTime, startTime: $startTime) {\\n    adhoctaskId\\n    driverId\\n    note\\n    startTime\\n    endDeadline\\n    issueType\\n    delayedTask\\n    __typename\\n  }\\n}"}\'',
        cookies: {},
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
          catalogid: "'10054'",
          langid: "'-1'",
          name: 'assortment_enable',
          responseformat: 'json',
          src: 'app',
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
        cookies: {},
        reason: 'Unauthorized',
        status_code: 401,
        text: "''",
        url: 'https://p157-contacts.icloud.com:443/mm/sub?token=b37163f4e3f63e20192b40e3bfe0ce293ba129f9706437f0dc0dce3e2bea9268&key=16304401481',
      },
      severity: 'MEDIUM',
      confidence: 'LOW',
      url: 'p157-contacts.icloud.com:443/mm/sub',
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
        cookies: {},
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
        cookies: {},
        reason: 'Unauthorized',
        status_code: 401,
        text: "''",
        url: 'https://p157-contacts.icloud.com:443/mm/sub?token=%3B+OR+%271%27%3D%271%27&key=16304401481',
      },
      severity: 'MEDIUM',
      confidence: 'LOW',
      url: '',
      description: '',
    },
  ];

  const content4 =
    'mobile.useinsider.com:443/api/v3/session/start: The time elapsed between the sending of the request and the arrival of the response exceeds the expected amount of time, suggesting a vulnerability to command injection attacks.\nconfidence: MEDIUM\nparam:\n  location: headers\n  method: POST\n  variables:\n  - Accept\n  - Content-Type\n  - Accept-Language\n  - Host\n  - Content-Length\n  - Connection\n  - Accept-Encoding\n  - User-Agent\n  - Ts\nrequest:\n  body: \'{"insider_id": "53B4EFCC2CFD40AAA5BF73B303F90BEB", "device_info": {"location_enabled":\n    false, "app_version": "5.6.0", "push_enabled": false, "os_version": "16.7.7",\n    "battery": 100, "sdk_version": "13.0.0", "connection": "wifi"}, "partner_name":\n    "nbdliv", "calledDueToInsiderIdChange": false, "first_run": true, "udid": "53B4EFCC2CFD40AAA5BF73B303F90BEB"}\'\n  headers:\n    Accept: \'*/*\'\n    Accept-Encoding: gzip, deflate, br\n    Ts: \'1717657521\'\n    User-Agent: Liv/666 CFNetwork/1410.1 Darwin/22.6.0\n  method: POST\n  params: {}\n  url: https://mobile.useinsider.com:443/api/v3/session/start\nresponse:\n  cookies:\n    __cf_bm: Y344vnTG2lq7wTlqEMFGsTIQ3PlYUFLpHkTrqTVlEzI-1717659521-1.0.1.1-mYaqUeGWUgRuX6qX3QSTYeBDLGEiWy7QvsPT.m.V81ZZla2e22iXwUZND2QPqL4Cv2r0yvmQuigDf0_Y_dAx8A\n  headers:\n    CF-RAY: 88f6be8aaa872258-ORD\n    Cache-Control: private,\n    Vary: Accept-Encoding\n    X-Frame-Options: SAMEORIGIN\n  reason: Forbidden\n  status_code: 403\n  text: "\\uFFFD(\\uFFFD\\0 \\uFFFDM"';

  const expectedObject4 = [
    {
      confidence: 'MEDIUM',
      description:
        'The time elapsed between the sending of the request and the arrival of the response exceeds the expected amount of time, suggesting a vulnerability to command injection attacks.',
      request: {
        body: '\'{"insider_id": "53B4EFCC2CFD40AAA5BF73B303F90BEB", "device_info": {"location_enabled":\n    false, "app_version": "5.6.0", "push_enabled": false, "os_version": "16.7.7",\n    "battery": 100, "sdk_version": "13.0.0", "connection": "wifi"}, "partner_name":\n    "nbdliv", "calledDueToInsiderIdChange": false, "first_run": true, "udid": "53B4EFCC2CFD40AAA5BF73B303F90BEB"}\'',
        cookies: {},
        headers: {
          accept: "'*/*'",
          'accept-encoding': 'gzip, deflate, br',
          ts: "'1717657521'",
          'user-agent': 'Liv/666 CFNetwork/1410.1 Darwin/22.6.0',
        },
        method: 'POST',
        params: {},
        url: 'https://mobile.useinsider.com:443/api/v3/session/start',
      },
      response: {
        cookies: {
          __cf_bm:
            'Y344vnTG2lq7wTlqEMFGsTIQ3PlYUFLpHkTrqTVlEzI-1717659521-1.0.1.1-mYaqUeGWUgRuX6qX3QSTYeBDLGEiWy7QvsPT.m.V81ZZla2e22iXwUZND2QPqL4Cv2r0yvmQuigDf0_Y_dAx8A',
        },
        headers: {
          'cache-control': 'private,',
          'cf-ray': '88f6be8aaa872258-ORD',
          vary: 'Accept-Encoding',
          'x-frame-options': 'SAMEORIGIN',
        },
        reason: 'Forbidden',
        status_code: 403,
        text: '"\\uFFFD(\\uFFFD\\0 \\uFFFDM"',
        url: '',
      },
      severity: '',
      url: 'mobile.useinsider.com:443/api/v3/session/start',
    },
  ];

  const content5 =
    'mobile-collector.newrelic.com:443/mobile/v3/data: The difference in length between the response to the baseline request and the request returned when sending an attack string exceeds 1000.0 percent, which could indicate a vulnerability to injection attacks\nconfidence: LOW\nparam:\n  location: headers\n  method: POST\n  variables:\n  - Connection\n  - Content-Length\n  - Content-Type\n  - User-Agent\n  - Content-Encoding\n  - Accept-Encoding\n  - X-Newrelic-Connect-Time\nrequest:\n  body: \'[[482998014, 594496047], ["Android", "10", "Mi A2", "AndroidAgent", "6.9.0",\n    "b36f41b0-37ae-4a68-9a54-d860c6876323", "", "", "Xiaomi", {"size": "normal", "platform":\n    "Native", "platformVersion": "6.9.0"}], 0.0, [], [[{"scope": "", "name": "Memory/Used"},\n    {"count": 1, "total": 76.3740234375, "min": 76.3740234375, "max": 76.3740234375,\n    "sum_of_squares": 5832.991456031799}]], [], [], [], {}, []]\'\n  headers:\n    Accept-Encoding: gzip\n    Connection: Keep-Alive\n    Content-Encoding: identity\n    Content-Length: \'358\'\n    Content-Type: application/json\n    Host: mobile-collector.newrelic.com:443\n    User-Agent: Dalvik/2.1.0 (Linux; U; Android 10; Mi A2 Build/QQ3A.200805.001)\n    X-App-License-Key: AAa728a7f147e1cf95a25a315203d656a36f602257-NRMA\n    X-Newrelic-Connect-Time: \'*!@#$^&()[]{}|.,"\\\'\'/\'\'\'\'"\'\n  method: POST\n  params: {}\n  url: https://mobile-collector.newrelic.com:443/mobile/v3/data\nresponse:\n  cookies: {}\n  headers:\n    CF-Cache-Status: DYNAMIC\n    CF-Ray: 89e502ccbbcbc5cb-ORD\n    Connection: keep-alive\n    Content-Length: \'2\'\n    Content-Type: application/json; charset=UTF-8\n    Date: Fri, 05 Jul 2024 05:38:48 GMT\n    Server: cloudflare\n    Vary: Accept-Encoding\n  reason: OK\n  status_code: 200\n  text: \'{}\'';

  const expectedObject5 = [
    {
      confidence: 'LOW',
      description:
        'The difference in length between the response to the baseline request and the request returned when sending an attack string exceeds 1000.0 percent, which could indicate a vulnerability to injection attacks',
      request: {
        body: '\'[[482998014, 594496047], ["Android", "10", "Mi A2", "AndroidAgent", "6.9.0",\n    "b36f41b0-37ae-4a68-9a54-d860c6876323", "", "", "Xiaomi", {"size": "normal", "platform":\n    "Native", "platformVersion": "6.9.0"}], 0.0, [], [[{"scope": "", "name": "Memory/Used"},\n    {"count": 1, "total": 76.3740234375, "min": 76.3740234375, "max": 76.3740234375,\n    "sum_of_squares": 5832.991456031799}]], [], [], [], {}, []]\'',
        cookies: {},
        headers: {
          'accept-encoding': 'gzip',
          connection: 'Keep-Alive',
          'content-encoding': 'identity',
          'content-length': "'358'",
          'content-type': 'application/json',
          host: 'mobile-collector.newrelic.com:443',
          'user-agent':
            'Dalvik/2.1.0 (Linux; U; Android 10; Mi A2 Build/QQ3A.200805.001)',
          'x-app-license-key':
            'AAa728a7f147e1cf95a25a315203d656a36f602257-NRMA',
          'x-newrelic-connect-time': "'*!@#$^&()[]{}|.,\"\\''/''''\"'",
        },
        method: 'POST',
        params: {},
        url: 'https://mobile-collector.newrelic.com:443/mobile/v3/data',
      },
      response: {
        cookies: {},
        headers: {
          'cf-cache-status': 'DYNAMIC',
          'cf-ray': '89e502ccbbcbc5cb-ORD',
          connection: 'keep-alive',
          'content-length': "'2'",
          'content-type': 'application/json; charset=UTF-8',
          date: 'Fri, 05 Jul 2024 05:38:48 GMT',
          server: 'cloudflare',
          vary: 'Accept-Encoding',
        },
        reason: 'OK',
        status_code: 200,
        text: "'{}'",
        url: '',
      },
      severity: '',
      url: 'mobile-collector.newrelic.com:443/mobile/v3/data',
    },
  ];

  const vulnerableApiFindings = [
    { content: content1, expectedObject: expectedObject1 },
    { content: content2, expectedObject: expectedObject2 },
    { content: content3, expectedObject: expectedObject3 },
    { content: content4, expectedObject: expectedObject4 },
    { content: content5, expectedObject: expectedObject5 },
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

  test.each(
    'should return false if content does not contains vulnerability indicators',
    [
      'description: This is just a regular log entry.',
      'An activity was found using an insecure randomization function via the Math.random method in Lcom/talview/recruit/utils/SntpClient;->writeTimeStamp(. As a result, the generated random data will be predictable and an attacker can guess or infer sensitive information',
    ],
    (assert, contentWithoutVulnerability) => {
      const result = isVulnerableApiFinding(contentWithoutVulnerability);

      assert.false(result);
    }
  );
});
