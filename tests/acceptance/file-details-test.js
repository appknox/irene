import { module, test } from 'qunit';
import { currentURL, click, visit, findAll } from '@ember/test-helpers';
import { setupRequiredEndpoints } from '../helpers/acceptance-utils';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';

import { serializer } from 'irene/tests/test-utils';
import ENUMS from 'irene/enums';

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

module('Acceptance | file details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, vulnerabilities } = await setupRequiredEndpoints(
      this.server
    );

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
    this.owner.register('service:poll', PollServiceStub);

    const analyses = vulnerabilities.map((v, id) =>
      this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
    );

    const profile = this.server.create('profile', { id: '1' });

    const project = this.server.create('project', {
      active_profile_id: profile.id,
    });

    const file = this.server.create('file', {
      is_static_done: true,
      dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
      project: project.id,
      analyses,
    });

    this.server.createList('unknown-analysis-status', 3, {
      status: true,
    });

    this.server.create('dynamicscan', { expires_on: null });

    this.server.create('device-preference', {
      id: profile.id,
    });

    // Server mocks
    this.server.get('/organizations/:id', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('organizations/:id/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.server.get('/dynamicscan/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id/device_preference', (schema, req) => {
      return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/projects/:id/available-devices', (schema) => {
      const results = schema.projectAvailableDevices.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/manualscans/:id', (schema, req) => {
      return { id: req.params.id };
    });

    this.setProperties({
      project,
      file,
      profile,
      organization,
    });
  });

  test('it renders and triggers go to latest file CTA button when current file is not latest and no sbom file exists', async function (assert) {
    this.organization.update({
      features: {
        sbom: true,
      },
    });

    this.server.create('file-report', { id: '1', progress: 100 });

    // Creates a new file with id of 2
    const latestFile = this.server.create('file', {
      dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
    });

    // project that has a latest file of id 2
    this.project.update({ last_file_id: latestFile.id });

    // Updates file with id of 1 with project that has a latest file of id 2
    latestFile.update({ is_static_done: true, project: this.project.id });

    this.server.get('/v2/files/:fileId/reports', (schema) => {
      return serializer(schema.fileReports.all(), true);
    });

    this.server.get('/v2/sb_projects/:id', (schema, req) => {
      return schema.sbomProjects.find(req.params.id)?.toJSON();
    });

    this.server.get('/v2/sb_reports/:id', (schema, req) => {
      return schema.sbomReports.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id/sb_file', () => {
      return {
        id: 1,
        file: 1,
      };
    });

    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomReports.all().models;
      return { count: results.length, next: null, previous: null, results };
    });

    // Current file in route has an fileid of 1
    await visit('/dashboard/file/1');

    assert.dom('[data-test-fileReportBtn]').exists();

    await click('[data-test-fileReportBtn]');

    assert
      .dom(`[data-test-fileReportDrawer-groupItem="sbom-reports"]`)
      .exists();

    await click(
      '[data-test-fileReportDrawer-groupItem="sbom-reports"] [data-test-ak-accordion-summary]'
    );

    assert
      .dom(
        `[data-test-fileReportDrawer-groupItem="sbom-reports"] [data-test-ak-accordion-content-wrapper]`
      )
      .exists()
      .hasClass(/expanded/);

    assert
      .dom('[data-test-fileReportDrawer-sbomReports-latestFileCTABtn]')
      .exists()
      .hasText(t('fileReport.goToLatestFile'));

    await click('[data-test-fileReportDrawer-sbomReports-latestFileCTABtn]');

    assert.strictEqual(currentURL(), `/dashboard/file/${latestFile.id}`);
  });

  test('test analysis row click to navigate to analysis page', async function (assert) {
    this.server.get('/v2/analyses/:id', (schema, req) => {
      return schema.analyses.find(`${req.params.id}`)?.toJSON();
    });

    await visit('/dashboard/file/1');

    assert
      .dom('[data-test-vulnerability-analysis-title]')
      .hasText(t('vulnerabilityDetails'));

    const rows = findAll('[data-test-vulnerability-analysis-row]');

    await click(rows[1]);

    const analyses = this.file.analyses
      .toArray()
      .sort((a, b) => b.computed_risk - a.computed_risk); // sort by computedRisk:desc

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/analysis/${analyses[1].id}`
    );
  });

  test('test sast view details click to navigate to static scan page', async function (assert) {
    await visit('/dashboard/file/1');

    await click('[data-test-fileDetailScanActions-staticScanViewDetails]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/static-scan`
    );
  });

  test('test dast view details click to navigate to dynamic scan page', async function (assert) {
    await visit('/dashboard/file/1');

    await click('[data-test-fileDetailScanActions-dynamicScanViewDetails]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/dynamic-scan/manual`
    );
  });

  test('test api view details click to navigate to api scan page', async function (assert) {
    await visit('/dashboard/file/1');

    await click('[data-test-fileDetailScanActions-apiScanViewDetails]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/api-scan`
    );
  });

  test('test manual view details click to navigate to manual scan page', async function (assert) {
    await visit('/dashboard/file/1');

    await click('[data-test-fileDetailScanActions-manualScanViewDetails]');

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/manual-scan`
    );
  });
});
