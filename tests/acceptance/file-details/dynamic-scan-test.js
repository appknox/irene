import { click, currentURL, findAll, visit } from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';
import { selectChoose } from 'ember-power-select/test-support';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { objectifyEncodedReqBody } from 'irene/tests/test-utils';
import styles from 'irene/components/ak-select/index.scss';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

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

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

class PollServiceStub extends Service {
  callback = null;
  interval = null;

  startPolling(cb, interval) {
    function stop() {}

    this.callback = cb;
    this.interval = interval;

    return stop;
  }
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
      is_dynamic_done: false,
      can_run_automated_dynamicscan: true,
      is_active: true,
      project: project.id,
      profile: profile.id,
      analyses,
    });

    const dynamicscan = this.server.create('dynamicscan', {
      id: profile.id,
      mode: 1,
      status: ENUMS.DYNAMIC_STATUS.RUNNING,
      ended_on: null,
    });

    const dynamicscanMode = this.server.create('dynamicscan-mode', {
      id: profile.id,
      dynamicscan_mode: 'Automated',
    });

    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
    this.owner.register('service:poll', PollServiceStub);

    this.server.create('device-preference', {
      id: profile.id,
    });

    // server api interception
    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/profiles/:id/device_preference', (schema, req) => {
      return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id/dynamicscan_mode', (schema, req) => {
      return schema.dynamicscanModes.find(`${req.params.id}`).toJSON();
    });

    this.server.get('/v2/dynamicscans/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/projects/:id/available-devices', (schema) => {
      const results = schema.projectAvailableDevices.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('v2/projects/:id/available_manual_devices', (schema) => {
      const results = schema.projectAvailableDevices.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    const store = this.owner.lookup('service:store');

    this.setProperties({
      organization,
      file,
      profile,
      store,
      dynamicscan,
      dynamicscanMode,
    });
  });

  test('it renders dynamic scan manual', async function (assert) {
    this.server.create('dynamicscan', {
      id: this.profile.id,
      mode: 0,
      status: ENUMS.DYNAMIC_STATUS.READY,
      ended_on: null,
    });

    this.server.get('/v2/dynamicscans/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });

    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/manual`);

    assert
      .dom('[data-test-fileDetails-dynamicScan-header-breadcrumbContainer]')
      .exists();

    const breadcrumbItems = [t('allProjects'), t('scanDetails'), t('dast')];

    breadcrumbItems.map((item) => {
      assert
        .dom(
          `[data-test-fileDetails-dynamicScan-header-breadcrumbItem="${item}"]`
        )
        .exists();
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
      .dom(`[data-test-fileDetails-dynamicScan-manualDast-vncViewer]`)
      .exists();

    assert
      .dom('[data-test-fileDetails-dynamicScan-manualDast-fullscreenBtn]')
      .exists();

    await click('[data-test-fileDetails-dynamicScan-manualDast-fullscreenBtn]');

    assert
      .dom('[data-test-fileDetails-dynamicScan-manualDast-fullscreenModal]')
      .exists();

    assert.dom(`[data-test-vncViewer-device]`).exists();

    assert.dom('[data-test-modal-close-btn]').exists();

    await click('[data-test-modal-close-btn]');

    assert
      .dom('[data-test-fileDetails-dynamicScan-manualDast-fullscreenModal]')
      .doesNotExist();

    assert.dom('[data-test-NovncRfb-canvasContainer]').exists();
  });

  test('it renders expiry correctly', async function (assert) {
    this.server.create('dynamicscan', {
      id: this.profile.id,
      mode: 0,
      status: ENUMS.DYNAMIC_STATUS.RUNNING,
      ended_on: null,
      timeout_on: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    this.server.get('/v2/dynamicscans/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });

    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert.dom('[data-test-fileDetails-dynamicScan-expiry]').exists();

    assert
      .dom('[data-test-fileDetails-dynamicScan-expiry-time]')
      .hasText(/09:5/i);

    await click('[data-test-fileDetails-dynamicScan-expiry-extendBtn]');

    assert
      .dom('[data-test-fileDetails-dynamicScan-expiry-extendTime-menu-item]')
      .exists({ count: 3 });

    assert
      .dom(`[data-test-fileDetails-dynamicScan-automatedDast-vncViewer]`)
      .exists();

    assert.dom(`[data-test-vncViewer-device]`).exists();
  });

  test('it renders dynamic scan automated', async function (assert) {
    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

    assert
      .dom('[data-test-fileDetails-dynamicScan-header-breadcrumbContainer]')
      .exists();

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert.dom('[data-test-fileDetails-dynamicScan-expiry]').exists();

    // await click('[data-test-fileDetails-dynamicScan-expiry-extendBtn]');

    // assert
    //   .dom('[data-test-fileDetails-dynamicScan-expiry-extendTime-menu-item]')
    //   .exists({ count: 3 });

    assert
      .dom(`[data-test-fileDetails-dynamicScan-automatedDast-vncViewer]`)
      .exists();

    assert.dom(`[data-test-vncViewer-device]`).exists();

    assert
      .dom(`[data-test-vncViewer-automatedNote]`)
      .exists()
      .containsText(t('automatedScanVncNote'));

    assert
      .dom('[data-test-fileDetails-dynamicScan-automatedDast-fullscreenBtn]')
      .exists();

    await click(
      '[data-test-fileDetails-dynamicScan-automatedDast-fullscreenBtn]'
    );

    assert
      .dom('[data-test-fileDetails-dynamicScan-automatedDast-fullscreenModal]')
      .exists();

    assert
      .dom(`[data-test-vncViewer-automatedNote]`)
      .exists()
      .containsText(t('automatedScanVncNote'));

    assert.dom(`[data-test-vncViewer-device]`).exists();

    assert.dom('[data-test-modal-close-btn]').exists();

    await click('[data-test-modal-close-btn]');

    assert
      .dom('[data-test-fileDetails-dynamicScan-automatedDast-fullscreenModal]')
      .doesNotExist();
  });

  test.each(
    'test: start dynamic scan',
    [{ isAutomated: false }, { isAutomated: true }],
    async function (assert, { isAutomated }) {
      assert.expect();

      this.file = this.store.push(
        this.store.normalize('file', this.file.toJSON())
      );

      const DYNAMIC_SCAN_MODEL_ID = this.profile.id;
      const scanTypeText = isAutomated ? 'Automated' : 'Manual';

      this.server.create('dynamicscan', {
        id: DYNAMIC_SCAN_MODEL_ID,
        mode: isAutomated ? 1 : 0,
        status: ENUMS.DYNAMIC_STATUS.NONE,
      });

      this.server.get('/profiles/:id/api_scan_options', (schema, req) => {
        return { id: req.params.id, api_url_filters: '' };
      });

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: faker.internet.ip(),
          port: faker.internet.port(),
          enabled: false,
        };
      });

      this.server.get('v2/profiles/:id/ds_manual_device_preference', () => {
        return {
          ds_manual_device_selection:
            ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE,
        };
      });

      this.server.post('/v2/files/:id/dynamicscans', (_, req) => {
        const reqBody = objectifyEncodedReqBody(req.requestBody);

        assert.strictEqual(reqBody.mode, scanTypeText);

        assert.strictEqual(reqBody.enable_api_capture, 'false');

        // Start automated scan for dynamic scan object
        this.server.db.dynamicscans.update(DYNAMIC_SCAN_MODEL_ID, {
          status: isAutomated
            ? ENUMS.DYNAMIC_STATUS.RUNNING
            : ENUMS.DYNAMIC_STATUS.READY,
        });

        return new Response(200);
      });

      await visit(
        `/dashboard/file/${this.file.id}/dynamic-scan/${scanTypeText.toLowerCase()}`
      );

      assert
        .dom('[data-test-dynamicscan-startbtn]')
        .exists()
        .containsText(`${scanTypeText} DAST`);

      // Load dynamic scan drawer
      await click('[data-test-dynamicScan-startBtn]');

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]')
        .exists()
        .hasText(`${scanTypeText} DAST`);

      const drawerDynamicScanStartBtn =
        '[data-test-fileDetails-dynamicScanDrawer-startBtn]';

      if (!isAutomated) {
        assert.dom(drawerDynamicScanStartBtn).exists().isDisabled();

        // Select "Any Device"
        await selectChoose(
          `.${classes.trigger}`,
          'Use any available device with any OS version'
        );

        // Start button should be enabled
        assert.dom(drawerDynamicScanStartBtn).isNotDisabled();

        await click(drawerDynamicScanStartBtn);
      } else {
        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-closeBtn]'
          )
          .exists();

        // Drawer CTA Buttons
        assert.dom(drawerDynamicScanStartBtn).exists().hasText('Restart Scan');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-settingsPageRedirectBtn]'
          )
          .exists()
          .hasText('Go to General Settings')
          .hasAttribute('target', '_blank')
          .hasAttribute(
            'href',
            `/dashboard/project/${this.file.project.id}/settings`
          );

        await click(drawerDynamicScanStartBtn);

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-settingsPageRedirectBtn]'
          )
          .doesNotExist();
      }

      // Modal should be closed after successful start action
      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-drawerContainer]')
        .doesNotExist();

      assert.dom(drawerDynamicScanStartBtn).doesNotExist();
    }
  );

  test.each(
    'test: cancel/stop dynamic scan',
    [{ isAutomated: false }, { isAutomated: true }],
    async function (assert, { isAutomated }) {
      assert.expect();

      this.file = this.store.push(
        this.store.normalize('file', this.file.toJSON())
      );

      const DYNAMIC_SCAN_MODEL_ID = this.profile.id;
      const scanTypeText = isAutomated ? 'Automated' : 'Manual';

      const dynamicScan = this.server.create('dynamicscan', {
        id: DYNAMIC_SCAN_MODEL_ID,
        mode: isAutomated ? 1 : 0,
        status: isAutomated
          ? ENUMS.DYNAMIC_STATUS.RUNNING
          : ENUMS.DYNAMIC_STATUS.READY,
      });

      this.server.get('/profiles/:id/api_scan_options', (schema, req) => {
        return { id: req.params.id, api_url_filters: '' };
      });

      this.server.delete('/dynamicscans/:id', (_, req) => {
        // It deletes the correct dynamic scan ID
        assert.strictEqual(dynamicScan.id, req.params.id);

        // Start automated scan for dynamic scan object
        this.server.db.dynamicscans.update(DYNAMIC_SCAN_MODEL_ID, {
          status: ENUMS.DYNAMIC_STATUS.NONE,
        });

        return new Response(204);
      });

      await visit(
        `/dashboard/file/${this.file.id}/dynamic-scan/${scanTypeText.toLowerCase()}`
      );

      const statusChipSelector = '[data-test-dynamicScan-statusChip]';
      const stopBtn = '[data-test-dynamicScan-stopBtn]';
      const cancelBtn = '[data-test-dynamicScan-cancelBtn]';
      const scanStartBtn = '[data-test-dynamicScan-startBtn]';

      assert.dom(scanStartBtn).doesNotExist();

      if (!isAutomated) {
        assert.dom(statusChipSelector).doesNotExist();

        assert.dom(stopBtn).exists().containsText('Stop');

        await click(stopBtn);

        assert.dom(statusChipSelector).exists().containsText('Stopping');

        assert.dom(stopBtn).doesNotExist();
        assert.dom(scanStartBtn).doesNotExist();
      } else {
        assert.dom(statusChipSelector).exists().containsText('In Progress');
        assert.dom(cancelBtn).exists().containsText('Cancel Scan');

        assert
          .dom('[data-test-fileDetails-dynamicScan-expiry-time]')
          .exists()
          .hasText('00:00');

        assert
          .dom('[data-test-vncViewer-scanTriggeredAutomaticallyText]')
          .exists()
          .hasText('Scan triggered automatically on app upload.');

        await click(cancelBtn);

        assert.dom(statusChipSelector).hasText('Stopping');
        assert.dom(cancelBtn).doesNotExist();

        assert.dom(scanStartBtn).exists().containsText(`${scanTypeText} DAST`);
      }
    }
  );

  test('it should render toggle dast ui if automated dast is not enabled', async function (assert) {
    this.dynamicscanMode.update({ dynamicscan_mode: 'Manual' });

    this.server.create('proxy-setting', { id: this.profile.id });

    this.server.get('/profiles/:id/proxy_settings', (schema, req) => {
      return schema.proxySettings.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id/api_scan_options', (_, req) => ({
      id: req.params.id,
      api_url_filters: '',
    }));

    this.server.get(
      '/v2/projects/:projectId/scan_parameter_groups',
      function (schema) {
        const data = schema.scanParameterGroups.all().models;

        return {
          count: data.length,
          next: null,
          previous: null,
          results: data,
        };
      }
    );

    this.server.get(
      '/v2/scan_parameter_groups/:id/scan_parameters',
      (schema) => {
        const data = schema.scanParameters.all().models;

        return {
          count: data.length,
          next: null,
          previous: null,
          results: data,
        };
      }
    );

    this.server.get(
      '/organizations/:id/projects/:projectId/collaborators',
      (schema) => {
        const results = schema.projectCollaborators.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    this.server.get(
      '/organizations/:orgId/projects/:projectId/teams',
      (schema) => {
        const results = schema.projectTeams.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    this.server.get(
      '/organizations/:id/github_repos',
      () => new Response(404, {}, { detail: 'Github not integrated' })
    );

    this.server.get(
      '/projects/:id/github',
      () => new Response(400, {}, { detail: 'Github not integrated' })
    );

    this.server.get(
      '/organizations/:id/jira_projects',
      () => new Response(404, {}, { detail: 'JIRA not integrated' })
    );

    this.server.get(
      '/projects/:id/jira',
      () => new Response(404, {}, { detail: 'JIRA not integrated' })
    );

    this.server.get('/profiles/:id/dynamicscan_mode', (schema, req) => {
      return schema.dynamicscanModes.find(`${req.params.id}`).toJSON();
    });

    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

    assert
      .dom('[data-test-fileDetails-dynamicScan-automatedDast-disabledCard]')
      .exists();

    assert
      .dom('[data-test-fileDetails-dynamicScan-automatedDast-disabledTitle]')
      .exists()
      .containsText(t('toggleAutomatedDAST'));

    // TODO: add containsText here after correct text is given
    assert
      .dom('[data-test-fileDetails-dynamicScan-automatedDast-disabledDesc]')
      .exists();

    assert
      .dom(
        '[data-test-fileDetails-dynamicScan-automatedDast-disabledActionBtn]'
      )
      .exists();

    await click(
      '[data-test-fileDetails-dynamicScan-automatedDast-disabledActionBtn]'
    );

    assert.strictEqual(
      currentURL(),
      `/dashboard/project/${this.file.id}/settings`
    );
  });

  test('it should render upselling ui if automated dast is not enabled', async function (assert) {
    this.file.update({ can_run_automated_dynamicscan: false });

    this.organization.update({
      features: {
        dynamicscan_automation: false,
      },
    });

    await visit(`/dashboard/file/${this.file.id}/dynamic-scan/automated`);

    assert.dom('[data-test-automated-dast-upselling]').exists();
  });

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
