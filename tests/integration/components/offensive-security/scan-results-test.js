import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.OFFSEC_SCAN_STATUS;

// ─── Stubs ───────────────────────────────────────────────────────────────────

class NotificationsStub extends Service {
  errorMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success() {}
}

class RouterStub extends Service {
  lastRoute = null;
  lastModels = [];

  transitionTo(route, ...models) {
    this.lastRoute = route;
    this.lastModels = models;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const SELECTORS = {
  header: '[data-test-offensiveSecurity-scanResults-header]',
  failureBanner: '[data-test-offensiveSecurity-scanResults-failureBanner]',
  objective: '[data-test-offensiveSecurity-scanResults-objective]',
  summaryCard: '[data-test-offensiveSecurity-summaryCard]',
  summaryStat: '[data-test-offensiveSecurity-summaryCard-stat]',
  summaryRisk: '[data-test-offensiveSecurity-summaryCard-risk]',
  summaryUnassessed: '[data-test-offensiveSecurity-summaryCard-unassessed]',
  artifactsCard: '[data-test-offensiveSecurity-artifactsCard]',
  artifactRow: '[data-test-offensiveSecurity-artifactsCard-row]',
  artifactEmpty: '[data-test-offensiveSecurity-artifactsCard-empty]',
  findingsList: '[data-test-offensiveSecurity-findingsList]',
  findingRow: '[data-test-offensiveSecurity-findingsList-row]',
  findingsEmpty: '[data-test-offensiveSecurity-findingsList-empty]',
  agentLog: '[data-test-offensiveSecurity-agentLog]',
  agentLogInProgress: '[data-test-offensiveSecurity-agentLog-inProgress]',
  agentLogPane: '[data-test-offensiveSecurity-agentLog-pane]',
  statusRunning: '[data-test-offensiveSecurity-statusChip-running]',
  statusCompleted: '[data-test-offensiveSecurity-statusChip-completed]',
  statusFailed: '[data-test-offensiveSecurity-statusChip-failed]',
};

const TEMPLATE = hbs`<OffensiveSecurity::ScanResults @scanId={{this.scanId}} />`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createScan(test, overrides = {}) {
  return test.server.create('offsec-scan', {
    status: SCAN_STATUS.COMPLETED,
    objective: 'Bypass the root check and verify.',
    error_message: null,
    ...overrides,
  });
}

function serveScan(test, scan) {
  test.server.get('/v2/offsec/scans/:id', (schema, request) => ({
    ...scan.attrs,
    id: Number(request.params.id),
  }));
}

module('Integration | Component | offensive-security/scan-results', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');
  setupBrowserFakes(hooks, { window: true });

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
    // Ember pre-registers the real router service; it must be removed or the
    // component keeps resolving it and transitionTo throws.
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('it renders the scan header and summary', async function (assert) {
    const scan = createScan(this, { package_name: 'com.example.app' });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.header).exists();
    assert.dom(SELECTORS.header).containsText('com.example.app');
    assert.dom(SELECTORS.summaryCard).exists();
    assert.strictEqual(findAll(SELECTORS.summaryStat).length, 4);
  });

  test('it counts protections detected, bypassed and resisted', async function (assert) {
    const scan = createScan(this, {
      protections_detected: 10,
      protections_bypassed: 2,
      findings_assessed: 6,
      findings_unassessed: 4,
    });

    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    const stats = findAll(SELECTORS.summaryStat);

    // Resisted is the remainder of what was assessed — the agent never sends it.
    assert.dom(stats[0]).containsText('10');
    assert
      .dom(stats[0])
      .containsText(t('offensiveSecurity.protectionsDetected'));
    assert.dom(stats[1]).containsText('2');
    assert.dom(stats[1]).containsText(t('offensiveSecurity.bypassed'));
    assert.dom(stats[2]).containsText('4');
    assert.dom(stats[2]).containsText(t('offensiveSecurity.resisted'));
  });

  test('it hides the unassessed caption when everything was assessed', async function (assert) {
    const scan = createScan(this, {
      protections_detected: 6,
      protections_bypassed: 1,
      findings_assessed: 6,
      findings_unassessed: 0,
    });

    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.summaryCard).exists();
  });

  test('it renders the objective the agent was given', async function (assert) {
    const scan = createScan(this, { objective: 'Defeat the SSL pinning.' });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.objective).containsText('Defeat the SSL pinning.');
  });

  test('it lists artifacts without exposing a download url', async function (assert) {
    const scan = createScan(this, {
      artifacts: [
        { name: 'report.json', size: 2048, content_type: 'application/json' },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.artifactRow).exists({ count: 1 });
    assert.dom(SELECTORS.artifactsCard).exists();
    // Presigned URLs expire; the page must not carry one.
    assert.dom(`${SELECTORS.artifactsCard} a[href]`).doesNotExist();
  });

  test('it shows an empty state when there are no artifacts', async function (assert) {
    const scan = createScan(this, { artifacts: [] });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.artifactEmpty)
      .hasText(t('offensiveSecurity.noArtifacts'));
  });

  test('it lists findings for the scan', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 1,
          signature_id: 'root-01',
          name: 'Root detection',
          category: 'root_detection',
          outcome: 'bypassed',
          order: 0,
          evidence_ids: [],
        },
        {
          id: 2,
          signature_id: 'ssl-01',
          name: 'SSL pinning',
          category: 'ssl_pinning',
          outcome: 'resisted',
          order: 1,
          evidence_ids: [],
        },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.findingsList).exists();
    assert.strictEqual(findAll(SELECTORS.findingRow).length, 2);
  });

  test('it shows an empty state when there are no findings', async function (assert) {
    const scan = createScan(this, { findings: [] });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.findingsEmpty)
      .hasText(t('offensiveSecurity.noFindings'));
  });

  // ─── Status ────────────────────────────────────────────────────────────────

  test('a running scan shows the in-progress panel instead of a log', async function (assert) {
    const scan = createScan(this, { status: SCAN_STATUS.RUNNING });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.statusRunning).exists();
  });

  test('a completed scan shows the completed chip', async function (assert) {
    const scan = createScan(this, { status: SCAN_STATUS.COMPLETED });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.statusCompleted).exists();
  });

  test('a failed scan surfaces its error message', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.FAILED,
      error_message: 'Device unreachable',
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.statusFailed).exists();
    assert.dom(SELECTORS.failureBanner).containsText('Device unreachable');
  });

  // ─── Interaction ───────────────────────────────────────────────────────────

  test('clicking a finding transitions to its detail route', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 42,
          signature_id: 'root-01',
          name: 'Root detection',
          category: 'root_detection',
          outcome: 'bypassed',
          order: 0,
          evidence_ids: [],
        },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    await click(SELECTORS.findingRow);

    const router = this.owner.lookup('service:router');

    assert.strictEqual(
      router.lastRoute,
      'authenticated.dashboard.offensive-security.finding'
    );
    assert.deepEqual(router.lastModels, [String(scan.id), '42']);
  });

  test('it notifies and redirects when the scan cannot be loaded', async function (assert) {
    this.server.get('/v2/offsec/scans/:id', () => new Response(404, {}, {}));

    this.set('scanId', '999');
    await render(TEMPLATE);

    const notifications = this.owner.lookup('service:notifications');
    const router = this.owner.lookup('service:router');

    assert.ok(notifications.errorMsg);
    assert.strictEqual(
      router.lastRoute,
      'authenticated.dashboard.offensive-security.index'
    );
  });
});
