import { visit, click, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';

import {
  assertBreadcrumbsUI,
  navigateBackWithBreadcrumb,
} from 'irene/tests/helpers/breadcrumbs-utils';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

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
    const { organization, vulnerabilities } = await setupRequiredEndpoints(
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

    const profile = this.server.create('profile', { id: '1' });

    const project = this.server.create('project', {
      active_profile_id: profile.id,
      is_manual_scan_available: true,
    });

    const file = this.server.create('file', {
      is_static_done: true,
      is_dynamic_done: true,
      is_api_done: true,
      is_active: true,
      project: project.id,
      profile: profile.id,
      analyses,
    });

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

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
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

    this.setProperties({
      file,
      project,
      organization,
      store: this.owner.lookup('service:store'),
    });

    await visit(`/dashboard/file/${file.id}`);
  });

  test('it checks compare page breadcrumbs', async function (assert) {
    assert.expect();

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
    assert.expect();

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
    assert.expect();

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
    assert.expect();

    const tableRow = findAll('[data-test-vulnerability-analysis-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('vulnerabilityDetails')],
      assert
    );
  });

  test('it checks SAST details page breadcrumb', async function (assert) {
    assert.expect();

    assert
      .dom('[data-test-fileDetailScanActions-staticScanViewDetails]')
      .exists();

    await click('[data-test-fileDetailScanActions-staticScanViewDetails]');

    assertBreadcrumbsUI(
      [t('allProjects'), t('scanDetails'), t('sastResults')],
      assert
    );

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
    assert.expect();

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
    assert.expect();

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
    assert.expect();

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
  });
});
