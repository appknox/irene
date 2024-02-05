import { module, test } from 'qunit';
import { visit, currentURL, findAll, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';

import { SbomScanStatus } from 'irene/models/sbom-file';

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

module('Acceptance | sbom', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        sbom: true,
      },
    });

    const files = this.server.createList('file', 5);

    files.map((file) =>
      this.server.create('project', { last_file_id: file.id })
    );

    const sbomFiles = this.server.createList('sbom-file', 5);

    sbomFiles[1].update({
      status: SbomScanStatus.COMPLETED,
    });

    const sbomProjects = sbomFiles.map((sbomFile) =>
      this.server.create('sbom-project', { latest_sb_file: sbomFile.id })
    );

    this.server.create('sbom-scan-summary');

    const sbomComponents = this.server.createList('sbom-component', 10);

    this.server.get('/v2/server_configuration', () => {
      return {
        enterprise: false,
      };
    });

    this.server.get('/v2/sb_projects', (schema) => {
      const results = schema.sbomProjects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_projects/:id', (schema, req) => {
      return schema.sbomProjects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/sb_files/:id', (schema, req) => {
      return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get(
      '/v2/sb_projects/:id/sb_files/:fileId/summary',
      (schema) => {
        return schema.sbomScanSummaries.first()?.toJSON();
      }
    );

    this.server.get('/v2/sb_files/:scan_id/sb_components', (schema) => {
      const results = schema.sbomComponents.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      sbomProjects,
      sbomFiles,
      sbomComponents,
    });
  });

  test('test sbom app list row click should navigate to scan details', async function (assert) {
    await visit('/dashboard/sbom/apps');

    const contentRows = findAll('[data-test-sbomApp-row]');

    assert.strictEqual(contentRows.length, this.sbomProjects.length);

    await click(contentRows[1]);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );
  });

  test('test navigate to past scans & sbom scan list row click', async function (assert) {
    this.server.get('/v2/sb_projects/:id/sb_files', (schema) => {
      const results = schema.sbomFiles.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit('/dashboard/sbom/apps');

    const sbomAppRows = findAll('[data-test-sbomApp-row]');

    assert.strictEqual(sbomAppRows.length, this.sbomProjects.length);

    const secondRow = sbomAppRows[1].querySelectorAll(
      '[data-test-sbomApp-cell]'
    );

    await click(secondRow[4].querySelector('[data-test-sbomApp-actionBtn]'));

    const menuItems = findAll('[data-test-sbomApp-actionMenuItem]');

    assert.strictEqual(menuItems.length, 2);

    assert.dom('a', menuItems[0]).hasText(t('sbomModule.pastSbomAnalyses'));

    await click(menuItems[0].querySelector('a'));

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans`
    );

    const sbomFileRows = findAll('[data-test-sbomScan-row]');

    assert.strictEqual(sbomFileRows.length, this.sbomFiles.length);

    await click(sbomFileRows[1]);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );
  });

  test('it triggers sbom scan component details route on row click', async function (assert) {
    this.server.createList('sbom-vulnerability-audit', 3);

    this.server.get('/v2/sb_components/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get(
      '/v2/sb_components/:comp_id/sb_vulnerability_audits',
      (schema) => {
        const results = schema.sbomVulnerabilityAudits.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );

    const contentRows = findAll('[data-test-sbomComponent-row]');

    assert.strictEqual(contentRows.length, this.sbomComponents.length);

    await click(contentRows[2]);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${this.sbomComponents[2].id}`
    );
  });
});
