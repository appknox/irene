import { click, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

class RouterStub extends Service {
  transitionCalls = [];

  transitionTo(...args) {
    this.transitionCalls.push(args);
  }

  urlFor(...args) {
    return `/${args.join('/')}`;
  }
}

const SCAN_URL = {
  id: 9,
  request: {
    method: 'GET',
    scheme: 'https',
    host: 'api.example.com',
    port: '443',
    path: '/v1/accounts',
  },
  status: ENUMS.API_SCAN_URL_STATUS.COMPLETED,
  scanned_on: '2026-11-05T10:00:00Z',
  vulnerability_counts: { total: 3, critical: 1, high: 1, medium: 0, low: 1 },
};

const VULNERABILITIES = [
  {
    id: 1,
    vulnerability: { id: 65, name: 'General Server Vulnerabilities' },
    risk: ENUMS.RISK.CRITICAL,
    original_risk: ENUMS.RISK.CRITICAL,
    overridden_risk: null,
    cvss_base: 9.1,
    cvss_vector: '',
    analysis_id: 5098,
    findings: [],
  },
  {
    id: 2,
    vulnerability: { id: 72, name: 'SQL Injection Vulnerabilities' },
    risk: ENUMS.RISK.HIGH,
    original_risk: ENUMS.RISK.HIGH,
    overridden_risk: null,
    cvss_base: 8.2,
    cvss_vector: '',
    analysis_id: 5104,
    findings: [],
  },
  {
    id: 3,
    vulnerability: { id: 80, name: 'Insecure Content Security Policy' },
    risk: ENUMS.RISK.LOW,
    original_risk: ENUMS.RISK.MEDIUM,
    overridden_risk: ENUMS.RISK.LOW,
    cvss_base: 5.3,
    cvss_vector: '',
    analysis_id: null,
    findings: [],
  },
];

const riskLabel = (risk) =>
  analysisRiskStatus([risk, ENUMS.ANALYSIS.COMPLETED, false]).label;

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  method: '[data-test-fileDetails-apiScan-endpointVulnerabilities-method]',
  endpoint: '[data-test-fileDetails-apiScan-endpointVulnerabilities-endpoint]',
  desc: '[data-test-fileDetails-apiScan-endpointVulnerabilities-desc]',
  table: '[data-test-fileDetails-apiScan-endpointVulnerabilities-table]',
  row: '[data-test-fileDetails-apiScan-endpointVulnerabilities-row]',
  title: '[data-test-fileDetails-apiScan-endpointVulnerabilities-title]',
  empty: '[data-test-fileDetails-apiScan-endpointVulnerabilities-empty]',
  riskLabel: '[data-test-analysisRiskTag-label]',
  overriddenIcon: '[data-test-analysisRiskTag-editIcon]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <FileDetails::ApiScan::EndpointVulnerabilities
    @file={{this.file}}
    @urlId={{this.urlId}}
  />
`;

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | file-details/api-scan/endpoint-vulnerabilities',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      const store = this.owner.lookup('service:store');
      const file = this.server.create('file');

      this.server.get('/v2/files/:id/api_scan_urls/:urlId', () => SCAN_URL);
      this.server.get(
        '/v2/files/:id/api_scan_urls/:urlId/vulnerabilities',
        () => VULNERABILITIES
      );

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        urlId: String(SCAN_URL.id),
        router: this.owner.lookup('service:router'),
        notify: this.owner.lookup('service:notifications'),
      });
    });

    // ─── Loaded ──────────────────────────────────────────────────────────────

    test('it renders the endpoint and its vulnerabilities', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.method).hasText('GET');
      assert
        .dom(selectors.endpoint)
        .hasText('https://api.example.com/v1/accounts')
        .hasAttribute('title', 'https://api.example.com/v1/accounts');
      assert
        .dom(selectors.desc)
        .hasText(t('apiScanModule.endpointVulnerabilitiesDesc'));
      assert.dom(selectors.empty).doesNotExist();

      const rows = findAll(selectors.row);

      assert.strictEqual(rows.length, VULNERABILITIES.length);

      VULNERABILITIES.forEach((vulnerability, idx) => {
        assert
          .dom(selectors.title, rows[idx])
          .hasText(vulnerability.vulnerability.name);
        assert
          .dom(selectors.riskLabel, rows[idx])
          .hasText(riskLabel(vulnerability.risk));
      });
    });

    test('it marks a risk overridden on the analysis', async function (assert) {
      await render(TEMPLATE);

      const rows = findAll(selectors.row);

      assert.dom(selectors.overriddenIcon, rows[0]).doesNotExist();
      assert.dom(selectors.overriddenIcon, rows[2]).exists();
    });

    test('it renders the empty state when the endpoint has no vulnerabilities', async function (assert) {
      this.server.get(
        '/v2/files/:id/api_scan_urls/:urlId/vulnerabilities',
        () => []
      );

      await render(TEMPLATE);

      assert.dom(selectors.table).doesNotExist();
      assert
        .dom(selectors.empty)
        .hasText(t('apiScanModule.noEndpointVulnerabilities'));
    });

    test('it notifies when the endpoint cannot be loaded', async function (assert) {
      this.server.get(
        '/v2/files/:id/api_scan_urls/:urlId',
        () => new Response(404, {}, { detail: 'Not found.' })
      );

      await render(TEMPLATE);

      assert.strictEqual(this.notify.errorMsg, 'Not found.');
      assert.dom(selectors.endpoint).doesNotExist();
    });

    // ─── Row click ───────────────────────────────────────────────────────────

    test('it opens the analysis of the clicked vulnerability', async function (assert) {
      await render(TEMPLATE);

      assert.deepEqual(this.router.transitionCalls, []);

      await click(find(selectors.row));

      assert.deepEqual(this.router.transitionCalls, [
        [
          'authenticated.dashboard.file.analysis',
          this.file.id,
          String(VULNERABILITIES[0].analysis_id),
          { queryParams: { api_scan_url: String(SCAN_URL.id) } },
        ],
      ]);
    });

    test('it ignores clicks on a vulnerability without an analysis', async function (assert) {
      await render(TEMPLATE);

      await click(findAll(selectors.row)[2]);

      assert.deepEqual(this.router.transitionCalls, []);
    });
  }
);
