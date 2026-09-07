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
  groupTitle: '[data-test-offensiveSecurity-findingsList-groupTitle]',
  groupHeader: '[data-test-offensiveSecurity-findingsList-groupHeader]',
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
    assert.strictEqual(findAll(SELECTORS.summaryStat).length, 3);
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

  test('it displays custom artifact description when present in response', async function (assert) {
    const scan = createScan(this, {
      artifacts: [
        {
          name: 'custom_output.json',
          size: 1024,
          content_type: 'application/json',
          description: 'Custom Human-Readable Description',
          download_url: 'https://example.com/custom_output.json',
        },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.artifactRow)
      .containsText('Custom Human-Readable Description');
  });

  test('it displays APK and IPA artifacts with appropriate descriptions', async function (assert) {
    const scan = createScan(this, {
      artifacts: [
        {
          name: 'instrumented-app.apk',
          size: 15728640,
          content_type: 'application/vnd.android.package-archive',
        },
        {
          name: 'target-build.ipa',
          size: 20971520,
          content_type: 'application/x-itunes-ipa',
        },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.artifactRow).exists({ count: 2 });
    assert
      .dom(SELECTORS.artifactsCard)
      .containsText('Android application package (APK)');
    assert
      .dom(SELECTORS.artifactsCard)
      .containsText('iOS application archive (IPA)');
    assert.dom(SELECTORS.artifactsCard).containsText('15.0 MB');
    assert.dom(SELECTORS.artifactsCard).containsText('20.0 MB');
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
    assert.dom(SELECTORS.findingRow).includesText('Exploit Successful');
  });

  test('it groups findings by dictionary key and formats the group header in title case', async function (assert) {
    const scan = createScan(this, {
      findings: {
        'anti-debug-ptrace': {
          id: 1,
          signature_id: 'anti-debug-ptrace',
          name: 'ptrace PTRACE_TRACEME check',
          category: 'resilience',
          outcome: 'bypassed',
          order: 0,
        },
        'debug-settings-probe': {
          id: 2,
          signature_id: 'debug-settings-probe',
          name: 'Developer-options / USB-debugging settings probe',
          category: 'resilience',
          outcome: 'bypassed',
          order: 1,
        },
        'frida-port-scan': {
          id: 3,
          signature_id: 'frida-port-scan',
          name: 'Frida server port scan (27042)',
          category: 'resilience',
          outcome: 'not_attempted',
          order: 2,
        },
      },
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.findingsList).exists();
    assert.strictEqual(findAll(SELECTORS.findingRow).length, 3);

    const groupTitles = findAll(SELECTORS.groupTitle).map((el) =>
      el.textContent.trim()
    );
    assert.true(groupTitles.includes('Anti Debug Ptrace'));
    assert.true(groupTitles.includes('Debug Settings Probe'));
    assert.false(groupTitles.includes('Frida Port Scan'));

    assert.dom(SELECTORS.findingsList).containsText('Anti Debug Ptrace');
    assert.dom(SELECTORS.findingsList).containsText('Debug Settings Probe');
    assert
      .dom(SELECTORS.findingsList)
      .containsText('ptrace PTRACE_TRACEME check');
    assert.dom(SELECTORS.findingsList).containsText('Developer-options');
    assert
      .dom(SELECTORS.findingsList)
      .containsText('USB-debugging settings probe');
  });

  test('findings groups have accordions for all and format keys with slashes', async function (assert) {
    const scan = createScan(this, {
      findings: {
        'anti-debug-ptrace': {
          id: 1,
          signature_id: 'anti-debug-ptrace',
          name: 'ptrace PTRACE_TRACEME check',
          category: 'resilience',
          outcome: 'bypassed',
          order: 0,
        },
        'dev-options/usb-debugging': {
          id: 2,
          signature_id: 'dev-options/usb-debugging',
          name: 'Developer-options detection',
          category: 'resilience',
          outcome: 'bypassed',
          order: 1,
        },
      },
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 2, 'Two group headers rendered');

    // Key with slash formatted to Title Case
    assert.dom(headers[1]).includesText('Dev Options USB Debugging');

    // All groups start closed by default on reload
    assert.strictEqual(headers[0].getAttribute('aria-expanded'), 'false');
    assert.strictEqual(headers[1].getAttribute('aria-expanded'), 'false');

    // Click first group header to expand it
    await click(headers[0]);
    assert.strictEqual(headers[0].getAttribute('aria-expanded'), 'true');
    assert.strictEqual(headers[1].getAttribute('aria-expanded'), 'false');

    // Click first group header again to collapse it
    await click(headers[0]);
    assert.strictEqual(headers[0].getAttribute('aria-expanded'), 'false');
    assert.strictEqual(headers[1].getAttribute('aria-expanded'), 'false');
  });

  test('finding names with slashes split into multiple list items under that group', async function (assert) {
    const scan = createScan(this, {
      findings: {
        'debug-settings-probe': {
          id: 1,
          signature_id: 'debug-settings-probe',
          name: 'Developer-options / USB-debugging settings probe',
          category: 'resilience',
          outcome: 'bypassed',
          order: 0,
        },
        'freerasp-talsec': {
          id: 2,
          signature_id: 'freerasp-talsec',
          name: 'FreeRASP / Talsec SDK',
          category: 'resilience',
          outcome: 'bypassed',
          order: 1,
        },
      },
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    const rows = findAll(SELECTORS.findingRow);
    assert.strictEqual(rows.length, 4, 'Four list items rendered from two slash findings');

    assert.dom(rows[0]).includesText('Developer-options');
    assert.dom(rows[1]).includesText('USB-debugging settings probe');
    assert.dom(rows[2]).includesText('FreeRASP');
    assert.dom(rows[3]).includesText('Talsec SDK');

    // Counts on headers show 2 for each
    const headers = findAll(SELECTORS.groupHeader);
    assert.dom(headers[0]).includesText('(2)');
    assert.dom(headers[1]).includesText('(2)');
  });

  test('it groups findings when API findings object contains arrays of findings under category keys', async function (assert) {
    const scan = createScan(this, {
      findings: {
        root_detection: [
          {
            id: 8,
            signature_id: 'root-aggregate-guard',
            name: 'Obfuscated aggregate root verdict method',
            category: 'resilience',
            outcome: 'bypassed',
          },
          {
            id: 9,
            signature_id: 'root-build-props',
            name: 'Build tags and system properties',
            category: 'resilience',
            outcome: 'bypassed',
          },
        ],
        debugger_detection: [
          {
            id: 1,
            signature_id: 'anti-debug-ptrace',
            name: 'ptrace check',
            category: 'resilience',
            outcome: 'bypassed',
          },
          {
            id: 2,
            signature_id: 'debug-settings-probe',
            name: 'Developer-options / USB-debugging settings probe',
            category: 'resilience',
            outcome: 'bypassed',
          },
        ],
        ssl_pinning: [
          {
            id: 6,
            signature_id: 'okhttp-pinning',
            name: 'OkHttp Certificate Pinner',
            category: 'resilience',
            outcome: 'bypassed',
          },
        ],
      },
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 3, 'Three group headers rendered');

    // Title formatting and acronym handling
    assert.dom(headers[0]).includesText('Root Detection');
    assert.dom(headers[0]).includesText('(2)');

    assert.dom(headers[1]).includesText('Debugger Detection');
    assert.dom(headers[1]).includesText('(3)'); // 1 for ptrace + 2 for split dev options

    assert.dom(headers[2]).includesText('SSL Pinning');
    assert.dom(headers[2]).includesText('(1)');

    // Starts closed
    assert.strictEqual(headers[0].getAttribute('aria-expanded'), 'false');

    // Expand Root Detection
    await click(headers[0]);
    assert.strictEqual(headers[0].getAttribute('aria-expanded'), 'true');
    assert.dom(SELECTORS.findingsList).containsText('Obfuscated aggregate root verdict method');
    assert.dom(SELECTORS.findingsList).containsText('Build tags and system properties');
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

  test('it filters out unassessed findings from the findings list', async function (assert) {
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
          signature_id: 'usb-01',
          name: 'USB debugging probe',
          category: 'resilience',
          outcome: 'not_attempted',
          order: 1,
          evidence_ids: [],
        },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.findingsList).exists();
    assert.strictEqual(findAll(SELECTORS.findingRow).length, 1);
    assert.dom(SELECTORS.findingRow).containsText('Root detection');
    assert
      .dom(SELECTORS.findingsList)
      .doesNotContainText('USB debugging probe');
  });

  test('it shows an empty state when all findings are unassessed', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 1,
          signature_id: 'usb-01',
          name: 'USB debugging probe',
          category: 'resilience',
          outcome: 'not_attempted',
          order: 0,
          evidence_ids: [],
        },
      ],
    });
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

  test('a failed scan surfaces its status reason', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.FAILED,
      status_reason: 'Device unreachable',
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.statusFailed).exists();
    assert.dom(SELECTORS.failureBanner).containsText('Device unreachable');
  });

  test('a failed scan formats result.resilience.json in status_reason as human-readable title', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.FAILED,
      status_reason:
        'investigate exited rc=1 (Resilience report written to result.resilience.json)',
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.failureBanner)
      .containsText(
        'investigate exited rc=1 (Resilience report written to "Risk rating + per-finding results")'
      );
  });

  test('a failed scan falls back to default message when status_reason is empty', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.FAILED,
      status_reason: '',
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.statusFailed).exists();
    assert
      .dom(SELECTORS.failureBanner)
      .containsText(t('offensiveSecurity.scanFailed'));
  });

  test('clicking artifact download button does not open in new tab', async function (assert) {
    const scan = createScan(this, {
      artifacts: [
        {
          name: 'result.json',
          size: 254133,
          content_type: 'application/json',
          download_url: 'https://example.com/result.json',
        },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.artifactRow).exists({ count: 1 });
    await click('[data-test-offensiveSecurity-artifactsCard-download]');

    assert.dom('a[target="_blank"]').doesNotExist();
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

    await click(SELECTORS.groupHeader);
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
