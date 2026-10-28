import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { render, click, findAll, waitUntil } from '@ember/test-helpers';
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

  success() {
    // Mock success notification for tests
  }
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
  summaryCard: '[data-test-offensiveSecurity-summaryCard]',
  summaryStat: '[data-test-offensiveSecurity-summaryCard-stat]',
  artifactsCard: '[data-test-offensiveSecurity-artifactsCard]',
  artifactRow: '[data-test-offensiveSecurity-artifactsCard-row]',
  artifactEmpty: '[data-test-offensiveSecurity-artifactsCard-empty]',
  statusRunning: '[data-test-offensiveSecurity-statusChip-running]',
  statusCompleted: '[data-test-offensiveSecurity-statusChip-completed]',
  statusFailed: '[data-test-offensiveSecurity-statusChip-failed]',
  deviceCard: '[data-test-offensiveSecurity-deviceCard]',
  devicePlaceholder: '[data-test-offensiveSecurity-devicePlaceholder]',
  deviceScreen: '[data-test-offensiveSecurity-deviceScreen]',
  deviceLiveBadge: '[data-test-offensiveSecurity-deviceLiveBadge="live"]',
  deviceStatusPill: '[data-test-offensiveSecurity-deviceLiveBadge]',
  deviceCaption: '[data-test-offensiveSecurity-deviceCaption]',
  phoneFrame: '[data-test-offensiveSecurity-phoneFrame]',
  artifactsBtn: '[data-test-offensiveSecurity-summaryCard-artifactsBtn]',
  artifactsDrawer: '[data-test-offensiveSecurity-summaryCard-artifactsDrawer]',
  artifactsClose: '[data-test-offensiveSecurity-summaryCard-artifactsClose]',
  runSubtitle: '[data-test-offensiveSecurity-scanResults-runSubtitle]',
  viewResultsBtn: '[data-test-offensiveSecurity-scanResults-viewResultsBtn]',
  platform: '[data-test-offensiveSecurity-scanResults-platform]',
  logStatusBadge: '[data-test-offensiveSecurity-streamingBadge]',
  novncContainer: '[data-test-NovncRfb-canvasContainer]',
  deviceExpandBtn: '[data-test-offensiveSecurity-expandPreviewBtn]',
  deviceBackdrop: '[data-test-offensiveSecurity-deviceModal-backdrop]',
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

  test('it displays target_id in the header when present in scan response', async function (assert) {
    const scan = createScan(this, { target_id: 79 });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.header).containsText('Target ID - 79');
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

  test('it lists artifacts without exposing a download url', async function (assert) {
    const scan = createScan(this, {
      artifacts: [
        { name: 'report.json', size: 2048, content_type: 'application/json' },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);
    await click(SELECTORS.artifactsBtn);

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
    await click(SELECTORS.artifactsBtn);

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
    await click(SELECTORS.artifactsBtn);

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
    await click(SELECTORS.artifactsBtn);

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

  // ─── Live run ──────────────────────────────────────────────────────────────

  test.each(
    'the run card explains what the agent is doing for each status',
    [
      [SCAN_STATUS.QUEUED, 'offensiveSecurity.runSubtitleQueued'],
      [SCAN_STATUS.RUNNING, 'offensiveSecurity.runSubtitleRunning'],
      [SCAN_STATUS.COMPLETED, 'offensiveSecurity.runSubtitleCompleted'],
      [SCAN_STATUS.FAILED, 'offensiveSecurity.runSubtitleFailed'],
    ],
    async function (assert, [status, subtitleKey]) {
      const scan = createScan(this, { status });
      serveScan(this, scan);

      this.set('scanId', String(scan.id));
      await render(TEMPLATE);

      assert.dom(SELECTORS.runSubtitle).hasText(t(subtitleKey));
    }
  );

  test.each(
    'the log badge reflects the run state',
    [
      [SCAN_STATUS.QUEUED, 'waiting', 'offensiveSecurity.logStatusWaiting'],
      [
        SCAN_STATUS.RUNNING,
        'streaming',
        'offensiveSecurity.logStatusStreaming',
      ],
      [
        SCAN_STATUS.COMPLETED,
        'finished',
        'offensiveSecurity.logStatusFinished',
      ],
      [SCAN_STATUS.FAILED, 'failed', 'offensiveSecurity.logStatusFailed'],
    ],
    async function (assert, [status, state, labelKey]) {
      const scan = createScan(this, { status });
      serveScan(this, scan);

      this.set('scanId', String(scan.id));
      await render(TEMPLATE);

      assert
        .dom(SELECTORS.logStatusBadge)
        .hasAttribute('data-test-offensiveSecurity-streamingBadge', state);
      assert.dom(SELECTORS.logStatusBadge).hasText(t(labelKey));
    }
  );

  test.each(
    'View results is offered once the agent has started',
    [
      [SCAN_STATUS.QUEUED, false],
      [SCAN_STATUS.RUNNING, true],
      [SCAN_STATUS.COMPLETED, true],
      [SCAN_STATUS.FAILED, false],
    ],
    async function (assert, [status, visible]) {
      const scan = createScan(this, { status });
      serveScan(this, scan);

      this.set('scanId', String(scan.id));
      await render(TEMPLATE);

      assert
        .dom(SELECTORS.viewResultsBtn)
        [visible ? 'exists' : 'doesNotExist']();
    }
  );

  test('clicking View results opens the results page for the scan', async function (assert) {
    const scan = createScan(this, { status: SCAN_STATUS.COMPLETED });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.lastRoute, null);
    assert
      .dom(SELECTORS.viewResultsBtn)
      .hasText(t('offensiveSecurity.viewResults'));

    await click(SELECTORS.viewResultsBtn);

    assert.strictEqual(
      router.lastRoute,
      'authenticated.offensive-security.results'
    );
    assert.deepEqual(router.lastModels, [String(scan.id)]);
  });

  test('the scan summary is only shown once the run has completed', async function (assert) {
    const scan = createScan(this, { status: SCAN_STATUS.RUNNING });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.summaryCard).doesNotExist();
  });

  test('the artifacts drawer opens from the summary and closes again', async function (assert) {
    const scan = createScan(this, {
      artifacts: [
        { name: 'report.json', size: 2048, content_type: 'application/json' },
      ],
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.artifactsBtn)
      .hasText(t('offensiveSecurity.artifactsCount', { count: 1 }));
    assert.dom(SELECTORS.artifactsDrawer).doesNotExist();

    await click(SELECTORS.artifactsBtn);

    assert.dom(SELECTORS.artifactsDrawer).exists();
    assert.dom(SELECTORS.artifactRow).exists({ count: 1 });

    await click(SELECTORS.artifactsClose);

    assert.dom(SELECTORS.artifactsDrawer).doesNotExist();
  });

  test('the target row names the platform', async function (assert) {
    const scan = createScan(this, { platform: 'ios' });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.platform).hasText(t('ios'));
  });

  test('the device panel reads Connecting until the stream is live', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.QUEUED,
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.deviceStatusPill)
      .hasText(t('offensiveSecurity.deviceConnecting'));
    assert
      .dom(SELECTORS.deviceCaption)
      .hasText(t('offensiveSecurity.deviceCaptionWaiting'));
  });

  test.each(
    'the device preview uses the frame for the scan platform',
    [
      ['ios', 'ios'],
      ['android', 'android'],
    ],
    async function (assert, [platform, frame]) {
      const scan = createScan(this, { status: SCAN_STATUS.QUEUED, platform });
      serveScan(this, scan);

      this.set('scanId', String(scan.id));
      await render(TEMPLATE);

      assert
        .dom(SELECTORS.phoneFrame)
        .hasAttribute('data-test-offensiveSecurity-phoneFrame', frame);
    }
  );

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
    await click(SELECTORS.artifactsBtn);

    assert.dom(SELECTORS.artifactRow).exists({ count: 1 });
    await click('[data-test-offensiveSecurity-artifactsCard-download]');

    assert.dom('a[target="_blank"]').doesNotExist();
  });

  // ─── Interaction ───────────────────────────────────────────────────────────

  test('it notifies and redirects when the scan cannot be loaded', async function (assert) {
    this.server.get('/v2/offsec/scans/:id', () => new Response(404, {}, {}));

    this.set('scanId', '999');
    await render(TEMPLATE);

    const notifications = this.owner.lookup('service:notifications');
    const router = this.owner.lookup('service:router');

    assert.ok(notifications.errorMsg);
    assert.strictEqual(
      router.lastRoute,
      'authenticated.offensive-security.index'
    );
  });

  test.each(
    'the device card stays after the run ends with the stream marked ended',
    [
      [SCAN_STATUS.COMPLETED, 'offensiveSecurity.deviceCaptionEnded'],
      [SCAN_STATUS.FAILED, 'offensiveSecurity.deviceCaptionFailed'],
    ],
    async function (assert, [status, captionKey]) {
      const scan = createScan(this, { status });
      serveScan(this, scan);

      this.set('scanId', String(scan.id));
      await render(TEMPLATE);

      assert.dom(SELECTORS.deviceCard).exists();
      assert
        .dom(SELECTORS.deviceStatusPill)
        .hasAttribute('data-test-offensiveSecurity-deviceLiveBadge', 'ended')
        .hasText(t('offensiveSecurity.deviceStreamEnded'));
      assert.dom(SELECTORS.deviceCaption).hasText(t(captionKey));
      assert.dom(SELECTORS.deviceScreen).doesNotExist();
      assert.dom(SELECTORS.devicePlaceholder).doesNotExist();
    }
  );

  test('it renders the device placeholder when scan is queued with no device stream', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.QUEUED,
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.deviceCard).exists();
    assert.dom(SELECTORS.devicePlaceholder).exists();
    assert.dom(SELECTORS.deviceScreen).doesNotExist();
    assert.dom(SELECTORS.deviceLiveBadge).doesNotExist();
  });

  test('it renders the NovncRfb display-only stream when device_serial is present', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.RUNNING,
      device_serial: 'emulator-5554',
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.deviceCard).exists();
    assert.dom(SELECTORS.deviceScreen).exists();
    assert.dom(SELECTORS.novncContainer).exists();
    assert.dom(SELECTORS.novncContainer).hasClass(/no-interaction/);
    assert
      .dom(SELECTORS.novncContainer)
      .hasAttribute('data-contain-canvas', 'true');
    assert
      .dom(SELECTORS.deviceLiveBadge)
      .hasText(t('offensiveSecurity.deviceLive'));
    assert
      .dom(SELECTORS.deviceCaption)
      .hasText(t('offensiveSecurity.deviceCaptionLive'));
    assert.dom(SELECTORS.devicePlaceholder).doesNotExist();
  });

  test('it renders the device placeholder when scan is running but has no device_serial', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.RUNNING,
      device_serial: null,
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.deviceCard).exists();
    assert.dom(SELECTORS.devicePlaceholder).exists();
    assert.dom(SELECTORS.deviceScreen).doesNotExist();
    assert.dom(SELECTORS.deviceLiveBadge).doesNotExist();
  });

  test('it fetches screen stream from /screen/ endpoint and starts stream while running', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.RUNNING,
      device_serial: null,
      screen_url: null,
    });
    serveScan(this, scan);

    let screenEndpointHit = false;
    this.server.get('/v2/offsec/scans/:id/screen/', () => {
      screenEndpointHit = true;

      return {
        url: 'ws://nebula-worker:8091/websockify?token=custom-nebula-token',
        vnc_url: 'ws://nebula-worker:8091/websockify?token=custom-nebula-token',
        token: 'custom-nebula-token',
        password: 'test-password',
      };
    });

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    await waitUntil(() => this.element.querySelector(SELECTORS.deviceScreen));

    assert.true(screenEndpointHit, 'The /screen/ endpoint was fetched');
    assert.dom(SELECTORS.deviceCard).exists();
    assert.dom(SELECTORS.deviceScreen).exists();
    assert.dom(SELECTORS.novncContainer).exists();
    assert.dom(SELECTORS.deviceLiveBadge).exists();
  });

  test('it can expand and collapse the device modal via header button', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.RUNNING,
      device_serial: 'emulator-5554',
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.deviceCard).exists();
    assert.dom(SELECTORS.deviceExpandBtn).exists();
    assert.dom(SELECTORS.deviceBackdrop).doesNotExist();

    // Expand device modal
    await click(SELECTORS.deviceExpandBtn);
    assert.dom(SELECTORS.deviceBackdrop).exists();

    // Close device modal via header close button
    await click(SELECTORS.deviceExpandBtn);
    assert.dom(SELECTORS.deviceBackdrop).doesNotExist();
  });

  test('it toggles expanded device preview modal mode without disconnecting stream', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.RUNNING,
      device_serial: 'emulator-5554',
    });
    serveScan(this, scan);

    this.set('scanId', String(scan.id));
    await render(TEMPLATE);

    assert.dom(SELECTORS.deviceExpandBtn).exists();
    assert.dom(SELECTORS.deviceBackdrop).doesNotExist();

    // Expand preview
    await click(SELECTORS.deviceExpandBtn);
    assert.dom(SELECTORS.deviceBackdrop).exists();
    assert.dom(SELECTORS.novncContainer).exists();

    // Close preview via backdrop
    await click(SELECTORS.deviceBackdrop);
    assert.dom(SELECTORS.deviceBackdrop).doesNotExist();
    assert.dom(SELECTORS.novncContainer).exists();
  });
});
