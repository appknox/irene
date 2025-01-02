import {
  click,
  currentURL,
  find,
  findAll,
  visit,
  waitUntil,
} from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import WebsocketService from 'irene/services/websocket';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { objectifyEncodedReqBody } from 'irene/tests/test-utils';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends WebsocketService {
  async connect() {}

  async configure() {}
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }

  setDefaultAutoClear() {}
}

// helper function to create a dynamic scan status helper
function createDynamicScanStatusHelper(owner, dynamicscan) {
  const websocket = owner.lookup('service:websocket');

  return async function assertScanStatus(
    assert,
    status,
    expectedStatusText,
    expectedAction = null
  ) {
    // Update server status
    dynamicscan.update({ status });

    // Simulate websocket message
    websocket.onObject({ id: dynamicscan.id, type: 'dynamicscan' });

    // Wait for status text to update
    await waitUntil(() => {
      const statusEl = find('[data-test-fileDetails-dynamicScan-statusChip]');

      return expectedStatusText
        ? statusEl?.textContent.includes(expectedStatusText)
        : !statusEl;
    });

    // Assert status chip text
    if (expectedStatusText) {
      assert
        .dom('[data-test-fileDetails-dynamicScan-statusChip]')
        .hasText(expectedStatusText);
    } else {
      assert
        .dom('[data-test-fileDetails-dynamicScan-statusChip]')
        .doesNotExist();
    }

    // Assert action button if specified
    if (expectedAction) {
      assert
        .dom(`[data-test-fileDetails-dynamicScanAction="${expectedAction}"]`)
        .isNotDisabled();
    }
  };
}

module('Acceptance | file-details/dynamic-scan', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { vulnerabilities, organization } = await setupRequiredEndpoints(
      this.server
    );

    organization.update({
      features: {
        dynamicscan_automation: true,
      },
    });

    const analyses = vulnerabilities.map((v, id) =>
      this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
    );

    const project = this.server.create('project');
    const profile = this.server.create('profile', { id: '1' });

    const file = this.server.create('file', {
      id: '1',
      is_static_done: true,
      is_active: true,
      project: project.id,
      profile: profile.id,
      analyses,
    });

    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    // lookup services
    this.breadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    // server api interception
    this.server.get('/v2/server_configuration', () => ({
      devicefarm_url: 'https://devicefarm.app.com',
      websocket: '',
      enterprise: false,
      url_upload_allowed: false,
    }));

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v2/files/:id/dynamicscans', (schema, req) => {
      const { limit, mode } = req.queryParams || {};

      const results = schema.dynamicscans
        .where({
          file: req.params.id,
          ...(mode ? { mode: Number(mode) } : {}),
        })
        .models.slice(0, limit ? Number(limit) : results.length);

      return {
        count: results.length,
        next: null,
        previous: null,
        results,
      };
    });

    this.server.get('v2/profiles/:id/automation_preference', (_, req) => {
      return { id: req.params.id, dynamic_scan_automation_enabled: true };
    });

    const store = this.owner.lookup('service:store');

    this.setProperties({
      organization,
      file,
      profile,
      project,
      store,
    });
  });

  test.each(
    'it renders DAST Page',
    ['manual', 'automated'],
    async function (assert, mode) {
      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/${mode}`);

      // Breadcrumbs test
      assert
        .dom('[data-test-fileDetails-dynamicScan-header-breadcrumbContainer]')
        .exists();

      this.breadcrumbsService.breadcrumbItems.map((item) => {
        assert
          .dom(`[data-test-ak-breadcrumbs-auto-trail-item-key="${item.route}"]`)
          .exists()
          .containsText(item.title);
      });

      assert.dom('[data-test-fileDetailsSummary-root]').exists();

      const tabs = [
        { id: 'manual-dast-tab', label: 'dastTabs.manualDAST' },
        { id: 'automated-dast-tab', label: 'dastTabs.automatedDAST' },
        { id: 'dast-results-tab', label: 'dastTabs.dastResults' },
      ];

      tabs.map((item) => {
        assert
          .dom(`[data-test-fileDetails-dynamicScan-header="${item.id}"]`)
          .exists();

        assert
          .dom(`[data-test-fileDetails-dynamicScan-header="${item.id}"]`)
          .containsText(t(item.label));
      });

      assert
        .dom(`[data-test-fileDetails-dynamicScan-${mode}Dast-header-text]`)
        .exists()
        .hasText(t('realDevice'));

      assert
        .dom(`[data-test-fileDetails-dynamicScan-${mode}Dast-fullscreenBtn]`)
        .doesNotExist();

      assert
        .dom('[data-test-fileDetails-dynamicScanAction="startBtn"]')
        .exists()
        .hasText(
          mode === 'manual' ? t('dynamicScan') : t('dastTabs.automatedDAST')
        );

      assert
        .dom(`[data-test-fileDetails-dynamicScan-${mode}Dast-vncViewer]`)
        .exists();

      assert
        .dom('[data-test-vncViewer-root]')
        .exists()
        .doesNotHaveClass(/vnc-viewer-fullscreen/);

      assert.dom('[data-test-vncViewer-device]').exists();

      assert.dom('[data-test-NovncRfb-canvasContainer]').doesNotExist();
    }
  );

  test.each(
    'it should start & stop/cancel dynamic scan',
    [
      { mode: 'manual', cancelInBetween: false, expectedAssertions: 41 },
      { mode: 'manual', cancelInBetween: true, expectedAssertions: 35 },
      { mode: 'automated', cancelInBetween: false, expectedAssertions: 45 },
      { mode: 'automated', cancelInBetween: true, expectedAssertions: 38 },
    ],
    async function (assert, { mode, cancelInBetween, expectedAssertions }) {
      assert.expect(expectedAssertions);

      const createDynamicscan = () =>
        this.server.create('dynamicscan', {
          file: this.file.id,
          mode: ENUMS.DYNAMIC_MODE[mode.toUpperCase()],
          status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
          ended_on: null,
        });

      const availableDevices = this.server.createList(
        'available-manual-device',
        3
      );

      this.server.create('ds-manual-device-preference', {
        id: this.profile.id,
        ds_manual_device_selection:
          ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE,
        ds_manual_device_identifier: availableDevices[0].device_identifier,
      });

      this.server.create('ds-automated-device-preference', {
        id: this.profile.id,
      });

      this.server.post('/v2/files/:id/dynamicscans', (schema, req) => {
        const reqBody = objectifyEncodedReqBody(req.requestBody);

        // assert request body
        assert.strictEqual(
          reqBody.mode,
          String(ENUMS.DYNAMIC_MODE[mode.toUpperCase()])
        );

        assert.strictEqual(reqBody.enable_api_capture, 'false');

        // create and set dynamicscan data reference
        this.dynamicscan = createDynamicscan();

        return this.dynamicscan.toJSON();
      });

      this.server.get('/v2/dynamicscans/:id', (schema, req) => {
        return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
      });

      this.server.delete('/v2/dynamicscans/:id', () => {
        this.dynamicscan.update({
          status: ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED,
        });

        return new Response(204);
      });

      this.server.get('/v2/projects/:id/available_manual_devices', (schema) => {
        const results = schema.availableManualDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get(
        '/v2/profiles/:id/ds_manual_device_preference',
        (schema, req) => {
          return schema.dsManualDevicePreferences
            .find(`${req.params.id}`)
            ?.toJSON();
        }
      );

      this.server.get(
        '/v2/profiles/:id/ds_automated_device_preference',
        (schema, req) => {
          return schema.dsAutomatedDevicePreferences
            .find(`${req.params.id}`)
            ?.toJSON();
        }
      );

      this.server.get('/profiles/:id/api_scan_options', () => ({
        id: '1',
        api_url_filters: '',
      }));

      this.server.get('/profiles/:id/proxy_settings', () => ({
        id: '1',
        host: faker.internet.ip(),
        port: faker.internet.port(),
        enabled: false,
      }));

      await visit(`/dashboard/file/${this.file.id}/dynamic-scan/${mode}`);

      assert
        .dom('[data-test-fileDetails-dynamicScan-header-breadcrumbContainer]')
        .exists();

      assert.dom('[data-test-fileDetailsSummary-root]').exists();

      assert
        .dom(`[data-test-fileDetails-dynamicScan-${mode}Dast-header-text]`)
        .hasText(t('realDevice'));

      assert
        .dom('[data-test-fileDetails-dynamicScanAction="startBtn"]')
        .isNotDisabled()
        .hasText(
          mode === 'manual' ? t('dynamicScan') : t('dastTabs.automatedDAST')
        );

      assert
        .dom(`[data-test-fileDetails-dynamicScan-${mode}Dast-fullscreenBtn]`)
        .doesNotExist();

      assert
        .dom(`[data-test-fileDetails-dynamicScan-${mode}Dast-vncViewer]`)
        .exists();

      assert.dom('[data-test-NovncRfb-canvasContainer]').doesNotExist();

      // Click start button
      await click('[data-test-fileDetails-dynamicScanAction="startBtn"]');

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-drawerContainer]')
        .exists();

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]')
        .hasText(
          mode === 'manual'
            ? t('dastTabs.manualDAST')
            : t('dastTabs.automatedDAST')
        );

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-startBtn]')
        .isNotDisabled()
        .hasText(
          mode === 'manual'
            ? t('start')
            : t('modalCard.dynamicScan.restartScan')
        );

      if (mode === 'automated') {
        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-settingsPageRedirectBtn]'
          )
          .hasText(t('modalCard.dynamicScan.goToGeneralSettings'))
          .hasAttribute('target', '_blank')
          .hasAttribute(
            'href',
            `/dashboard/project/${this.file.project}/settings`
          );
      }

      // start dynamic scan
      await click('[data-test-fileDetails-dynamicScanDrawer-startBtn]');

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-drawerContainer]')
        .doesNotExist();

      const assertScanStatus = createDynamicScanStatusHelper(
        this.owner,
        this.dynamicscan
      );

      // Test the scan status flow
      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
        t('deviceInQueue'),
        'cancelBtn'
      );

      if (mode === 'automated') {
        assert.dom('[data-test-vncViewer-manualScanNote]').doesNotExist();

        assert.dom('[data-test-vncViewer-scanTriggeredNote]').exists();

        assert
          .dom('[data-test-vncViewer-automatedNote]')
          .hasText(`${t('note')} - ${t('automatedScanVncNote')}`);
      } else {
        assert.dom('[data-test-vncViewer-automatedNote]').doesNotExist();
        assert.dom('[data-test-vncViewer-scanTriggeredNote]').doesNotExist();

        assert
          .dom('[data-test-vncViewer-manualScanNote]')
          .hasText(`${t('note')} - ${t('dynamicScanText')}`);
      }

      assert.dom('[data-test-fileDetails-dynamicScan-expiry]').doesNotExist();

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
        t('deviceBooting'),
        'cancelBtn'
      );

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING,
        t('deviceInstalling'),
        'cancelBtn'
      );

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.LAUNCHING,
        t('deviceLaunching'),
        'cancelBtn'
      );

      if (cancelInBetween) {
        // Cancel scan
        await click('[data-test-fileDetails-dynamicScanAction="cancelBtn"]');
      } else {
        await assertScanStatus(
          assert,
          ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_API_CAPTURE,
          t('deviceHooking'),
          'cancelBtn'
        );

        await assertScanStatus(
          assert,
          mode === 'manual'
            ? ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION
            : ENUMS.DYNAMIC_SCAN_STATUS.INITIATING_AUTO_INTERACTION,
          mode === 'manual' ? null : t('running'),
          'stopBtn'
        );

        if (mode === 'automated') {
          assert.dom('[data-test-vncViewer-scanTriggeredNote]').exists();

          assert
            .dom('[data-test-vncViewer-automatedNote]')
            .hasText(`${t('note')} - ${t('automatedScanVncNote')}`);
        } else {
          assert.dom('[data-test-fileDetails-dynamicScan-expiry]').exists();
        }

        assert.dom('[data-test-vncViewer-manualScanNote]').doesNotExist();

        // Stop scan
        await click('[data-test-fileDetails-dynamicScanAction="stopBtn"]');
      }

      await assertScanStatus(
        assert,
        ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
        t('deviceShuttingDown')
      );

      assert.dom('[data-test-fileDetails-dynamicScanAction]').doesNotExist();

      await assertScanStatus(
        assert,
        cancelInBetween
          ? ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED
          : ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
        cancelInBetween ? t('cancelled') : t('deviceCompleted'),
        cancelInBetween ? 'startBtn' : 'restartBtn'
      );

      assert.dom('[data-test-vncViewer-scanTriggeredNote]').doesNotExist();
      assert.dom('[data-test-vncViewer-automatedNote]').doesNotExist();
      assert.dom('[data-test-vncViewer-manualScanNote]').doesNotExist();
      assert.dom('[data-test-fileDetails-dynamicScan-expiry]').doesNotExist();
    }
  );

  test('it should navigate properly on tab click', async function (assert) {
    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/manual`);

    const tabLink = (id) =>
      `[data-test-fileDetails-dynamicScan-header="${id}"] a`;

    assert
      .dom(tabLink('manual-dast-tab'))
      .hasText(t('dastTabs.manualDAST'))
      .hasClass(/active-shadow/);

    await click(tabLink('automated-dast-tab'));

    assert
      .dom(tabLink('automated-dast-tab'))
      .hasText(t('dastTabs.automatedDAST'))
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/dynamic-scan/automated`
    );

    await click(tabLink('dast-results-tab'));

    assert
      .dom(tabLink('dast-results-tab'))
      .containsText(t('dastTabs.dastResults'))
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/dynamic-scan/results`
    );
  });

  test('it renders dynamic scan results', async function (assert) {
    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/results`);

    assert
      .dom('[data-test-fileDetails-dynamicScan-header-breadcrumbContainer]')
      .exists();

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    if (this.file.dynamicVulnerabilityCount) {
      assert
        .dom('[data-test-fileDetails-dynamicScan-header-badge-count]')
        .exists()
        .containsText(this.file.dynamicVulnerabilityCount);
    }

    assert
      .dom(
        "[data-test-fileDetails-dynamicScan-results-tabs='vulnerability-details-tab'] a"
      )
      .hasText(t('vulnerabilityDetails'))
      .hasClass(/active-line/);

    assert
      .dom('[data-test-fileDetails-dynamicScan-info]')
      .exists()
      .containsText(t('dastResultsInfo'));

    // assert vulnerability table
    const headerCells = findAll('[data-test-vulnerability-analysis-thead] th');

    assert.strictEqual(headerCells.length, 2);

    assert.dom(headerCells[0]).hasText(t('impact'));
    assert.dom(headerCells[1]).hasText(t('title'));

    const rows = findAll('[data-test-vulnerability-analysis-row]');

    const file = this.store.peekRecord('file', this.file.id);

    const dynamicAnalyses = file.analyses.filter((a) =>
      a.hasType(ENUMS.VULNERABILITY_TYPE.DYNAMIC)
    );

    assert.strictEqual(rows.length, dynamicAnalyses.length);

    // assert first row
    const firstRowCells = rows[0].querySelectorAll(
      '[data-test-vulnerability-analysis-cell]'
    );

    const analyses = dynamicAnalyses
      .slice()
      .sort((a, b) => b.computedRisk - a.computedRisk); // sort by computedRisk:desc

    const { label } = analysisRiskStatus([
      String(analyses[0].computedRisk),
      String(analyses[0].status),
      analyses[0].isOverriddenRisk,
    ]);

    assert
      .dom('[data-test-analysisRiskTag-label]', firstRowCells[0])
      .hasText(label);

    assert.dom(firstRowCells[1]).hasText(analyses[0].vulnerability.get('name'));
  });
});
