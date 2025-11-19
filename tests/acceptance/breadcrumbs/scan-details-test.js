import { visit, click, findAll, waitFor } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

import {
  assertBreadcrumbsUI,
  navigateBackWithBreadcrumb,
} from 'irene/tests/helpers/breadcrumbs-utils';

import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

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

module('Acceptance | breadcrumbs/scan-details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);
    await setupFileModelEndpoints(this.server);

    const store = this.owner.lookup('service:store');

    organization.update({
      features: {
        dynamicscan_automation: true,
      },
    });

    // Creates an analyses and maps a vulnerability to it
    const createAnalyses = (
      file,
      vulnerability,
      analysisStatus,
      computedRisk
    ) => {
      const analysis = this.server.create('analysis', { file: file.id });

      const normalizedAnalysis = store.normalize('analysis', {
        ...analysis.toJSON(),
        status: analysisStatus,
        computed_risk: computedRisk,
      });

      const analysisModel = store.push(normalizedAnalysis);

      analysisModel.set('vulnerability', vulnerability);

      return analysisModel;
    };

    const profile = this.server.create('profile', { id: '1' });

    const project = this.server.create('project', {
      active_profile_id: profile.id,
      is_manual_scan_available: true,
    });

    const types = [
      ENUMS.VULNERABILITY_TYPE.STATIC,
      ENUMS.VULNERABILITY_TYPE.DYNAMIC,
      ENUMS.VULNERABILITY_TYPE.MANUAL,
      ENUMS.VULNERABILITY_TYPE.API,
    ];

    const vulnerabilities = types.map((type) => {
      const vul = this.server.create('vulnerability', { types: [type] });

      const vulnerability = store.createRecord('vulnerability', {
        ...vul.toJSON(),
      });

      return vulnerability;
    });

    const files = this.server.createList('file', 5);

    const fileModels = files.map((file) => {
      const normalizedFile = store.normalize('file', {
        ...file.toJSON(),
        is_static_done: true,
        is_dynamic_done: true,
        is_api_done: true,
        is_active: true,
        project: project.id,
        profile: profile.id,
      });

      return store.push(normalizedFile);
    });

    const targetFile = fileModels[0];

    this.server.create('ds-automation-preference', {
      dynamic_scan_automation_enabled: true,
    });

    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    // server api interception
    this.server.get('/organizations/:id', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('organizations/:id/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/profiles/:id', (schema, req) => {
      return schema.profiles.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.server.get('/v3/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/projects/:id/files', (schema) => {
      const files = schema.files.all().models;

      return {
        count: files.length,
        next: null,
        previous: null,
        results: files,
      };
    });

    this.server.get('/profiles/:id/proxy_settings', (_, req) => {
      return {
        id: req.params.id,
        host: '',
        port: '',
        enabled: false,
      };
    });

    this.server.get('/profiles/:id/api_scan_options', (_, req) => {
      return { ds_api_capture_filters: [], id: req.params.id };
    });

    this.server.get(
      '/v2/projects/:projectId/scan_parameter_groups',
      function (schema) {
        const results = schema.scanParameterGroups.all().models;

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      }
    );

    this.server.get('/v2/analyses/:id', (schema, req) => {
      return schema.analyses.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get(
      '/v2/projects/:id/available_automated_devices',
      (schema) => {
        const results = schema.availableAutomatedDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    const file1 = fileModels[0];
    const file2 = fileModels[1];

    vulnerabilities.map((v) =>
      createAnalyses(file1, v, ENUMS.ANALYSIS.COMPLETED, ENUMS.RISK.HIGH)
    );

    vulnerabilities.map(() =>
      createAnalyses(file2, null, ENUMS.ANALYSIS.COMPLETED, ENUMS.RISK.HIGH)
    );

    this.setProperties({
      file: targetFile,
      project,
    });

    await visit(`/dashboard/file/${this.file.id}`);
  });

  test('it checks compare page breadcrumbs', async function (assert) {
    assert.expect(6);

    assert.dom('[data-test-fileDetailsSummary-moreMenuBtn]').exists();

    await click('[data-test-fileDetailsSummary-moreMenuBtn]');

    assert.dom('[data-test-ak-list-item-link]').exists();

    const menuItems = findAll('[data-test-ak-list-item-link]');

    await click(menuItems[0].querySelector('a'));

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('fileCompare.fileSelection')],
      assert
    );
  });

  test('it checks all upload page breadcrumbs', async function (assert) {
    assert.expect(12);

    assert.dom('[data-test-fileDetailsSummary-moreMenuBtn]').exists();

    await click('[data-test-fileDetailsSummary-moreMenuBtn]');

    assert.dom('[data-test-ak-list-item-link]').exists();

    const menuItems = findAll('[data-test-ak-list-item-link]');

    await click(menuItems[1].querySelector('a'));

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('allUploads')],
      assert
    );

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-settingsBtn]')
      .exists();

    await click('[data-test-fileCompareHeader-projectOverview-settingsBtn]');

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('allUploads'),
        `${t('settings')} (${this.project.package_name})`,
      ],
      assert
    );
  });

  test('it checks settings page breadcrumbs', async function (assert) {
    assert.expect(18);

    assert.dom('[data-test-fileDetailsSummary-moreMenuBtn]').exists();

    await click('[data-test-fileDetailsSummary-moreMenuBtn]');

    assert.dom('[data-test-ak-list-item-link]').exists();

    const menuItems = findAll('[data-test-ak-list-item-link]');

    await click(menuItems[2].querySelector('a'));

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        `${t('settings')} (${this.project.package_name})`,
      ],
      assert
    );

    await click(findAll('[data-test-ak-tab-item]')[1].querySelector('a'));

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        `${t('analysisSettings')} (${this.project.package_name})`,
      ],
      assert
    );

    await click(findAll('[data-test-ak-tab-item]')[2].querySelector('a'));

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        `${t('integration')} (${this.project.package_name})`,
      ],
      assert
    );

    await click(findAll('[data-test-ak-tab-item]')[3].querySelector('a'));

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        `${t('dastAutomation.title')} (${this.project.package_name})`,
      ],
      assert
    );
  });

  test('it checks vulnerability details page breadcrumb', async function (assert) {
    assert.expect(4);

    await waitFor('[data-test-vulnerability-analysis-row]');

    const tableRow = findAll('[data-test-vulnerability-analysis-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('vulnerabilityDetails')],
      assert
    );
  });

  test('it checks SAST details page breadcrumb', async function (assert) {
    assert.expect(10);

    assert
      .dom('[data-test-fileDetailScanActions-staticScanViewDetails]')
      .exists();

    await click('[data-test-fileDetailScanActions-staticScanViewDetails]');

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('sastResults')],
      assert
    );

    await waitFor('[data-test-vulnerability-analysis-row]');

    const tableRow = findAll('[data-test-vulnerability-analysis-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('sastResults'),
        t('vulnerabilityDetails'),
      ],
      assert
    );
  });

  test('it checks DAST details page breadcrumb', async function (assert) {
    assert.expect(24);

    assert
      .dom('[data-test-fileDetailScanActions-dynamicScanViewDetails]')
      .exists();

    await click('[data-test-fileDetailScanActions-dynamicScanViewDetails]');

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('dastTabs.manualDAST')],
      assert
    );

    await click(findAll('[data-test-ak-tab-item]')[1].querySelector('a'));

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('dastTabs.automatedDAST')],
      assert
    );

    assert
      .dom(
        '[data-test-fileDetails-dynamicScan-automatedDast-disabledActionBtn]'
      )
      .exists();

    await click(
      '[data-test-fileDetails-dynamicScan-automatedDast-disabledActionBtn]'
    );

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('dastTabs.automatedDAST'),
        `${t('dastAutomation.title')} (${this.project.package_name})`,
      ],
      assert
    );

    await navigateBackWithBreadcrumb();

    await click(findAll('[data-test-ak-tab-item]')[2].querySelector('a'));

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('dastTabs.dastResults')],
      assert
    );

    await waitFor('[data-test-vulnerability-analysis-row]');

    const tableRow = findAll('[data-test-vulnerability-analysis-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('dastTabs.dastResults'),
        t('vulnerabilityDetails'),
      ],
      assert
    );
  });

  test('it checks API Scan details page breadcrumb', async function (assert) {
    assert.expect(14);

    assert.dom('[data-test-fileDetailScanActions-apiScanViewDetails]').exists();

    await click('[data-test-fileDetailScanActions-apiScanViewDetails]');

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('apiScan')],
      assert
    );

    await click(findAll('[data-test-ak-tab-item]')[1].querySelector('a'));

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('apiScanResults')],
      assert
    );

    await waitFor('[data-test-vulnerability-analysis-row]');

    const tableRow = findAll('[data-test-vulnerability-analysis-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('apiScanResults'),
        t('vulnerabilityDetails'),
      ],
      assert
    );
  });

  test('it checks Manual Scan details page breadcrumb', async function (assert) {
    assert.expect(14);

    this.server.create('manualscan', { id: this.file.id });

    this.server.get('/manualscans/:id', (schema, req) => {
      return schema.manualscans.find(`${req.params.id}`)?.toJSON();
    });

    assert
      .dom('[data-test-fileDetailScanActions-manualScanViewDetails]')
      .exists();

    await click('[data-test-fileDetailScanActions-manualScanViewDetails]');

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('manualScan')],
      assert
    );

    this.file.set('manual', ENUMS.MANUAL.DONE);
    this.file.set('isManualDone', true);

    await click(
      `[data-test-filedetails-manualscan-tabs='manual-results-tab'] a`
    );

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('manualScanResults')],
      assert
    );

    await waitFor('[data-test-vulnerability-analysis-row]');

    const tableRow = findAll('[data-test-vulnerability-analysis-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('manualScanResults'),
        t('vulnerabilityDetails'),
      ],
      assert
    );
  });

  test('it checks compare page breadcrumbs in detial', async function (assert) {
    assert.expect(37);

    assert.dom('[data-test-fileDetailsSummary-moreMenuBtn]').exists();

    await click('[data-test-fileDetailsSummary-moreMenuBtn]');

    assert.dom('[data-test-ak-list-item-link]').exists();

    const menuItems = findAll('[data-test-ak-list-item-link]');

    await click(menuItems[0].querySelector('a'));

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('fileCompare.fileSelection')],
      assert
    );

    const selectCheckboxes = findAll('[data-test-fileoverview-selectcheckbox]');

    await click(selectCheckboxes[0]);

    await click('[data-test-filecompare-comparelistheader-comparebtn]');

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('fileCompare.fileSelection'),
        t('fileCompare.recurringIssues'),
      ],
      assert
    );

    await click(`[data-test-file-compare-tabs='new-issues-tab'] a`);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('fileCompare.fileSelection'),
        t('fileCompare.newIssues'),
      ],
      assert
    );

    await waitFor('[data-test-fileCompareTable-comparisonRow]');

    const rows = findAll('[data-test-fileCompareTable-comparisonRow]');

    await click(rows[1]);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('fileCompare.fileSelection'),
        t('fileCompare.newIssues'),
        t('testCase'),
      ],
      assert
    );

    await navigateBackWithBreadcrumb();

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('fileCompare.fileSelection'),
        t('fileCompare.newIssues'),
      ],
      assert
    );

    await click(`[data-test-file-compare-tabs='resolved-issues-tab'] a`);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('fileCompare.fileSelection'),
        t('fileCompare.resolvedIssues'),
      ],
      assert
    );

    await click(`[data-test-file-compare-tabs='untested-cases-tab'] a`);

    assertBreadcrumbsUI(
      [
        t('allProjects'),
        t('scanDetails'),
        t('fileCompare.fileSelection'),
        t('untested'),
      ],
      assert
    );
  });
});
