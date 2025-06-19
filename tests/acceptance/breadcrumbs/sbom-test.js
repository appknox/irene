import { visit, click, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import Service from '@ember/service';
import { faker } from '@faker-js/faker';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { assertBreadcrumbsUI } from 'irene/tests/helpers/breadcrumbs-utils';
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

module('Acceptance | breadcrumbs/sbom', function (hooks) {
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

    files.map((file, i) =>
      this.server.create('project', {
        last_file_id: file.id,
        platform: i === 2 ? 0 : faker.helpers.arrayElement([0, 1]),
      })
    );

    const sbomFiles = this.server.createList('sbom-file', 5);

    sbomFiles[0].update({
      status: SbomScanStatus.COMPLETED,
    });

    sbomFiles.map((sbomFile) =>
      this.server.create('sbom-project', { latest_sb_file: sbomFile.id })
    );

    sbomFiles.map((sbomFile) =>
      this.server.create('sbom-component', { sb_file: sbomFile.id })
    );

    this.server.create('sbom-scan-summary');

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

    this.server.get(
      '/v2/sb_files/:id/sb_file_components',
      (schema, request) => {
        this.set('query', request.queryParams.q);

        const results = schema.sbomComponents.all().models;

        const retdata = results.slice(
          request.queryParams.offset,
          request.queryParams.offset + request.queryParams.limit
        );

        return {
          count: retdata.length,
          next: null,
          previous: null,
          results: retdata,
        };
      }
    );

    this.server.get('/v2/sb_file_component/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/v2/sb_projects/:id/sb_files', (schema) => {
      const results = schema.sbomFiles.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      files,
    });

    await visit(`/dashboard/sbom/apps`);
  });

  test('it checks sbom page with tree nodes breadcrumbs', async function (assert) {
    assert.expect();

    const tableRow = findAll('[data-test-sbomApp-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
      ],
      assert
    );

    const treeNode = findAll('[data-test-component-tree-nodeLabel]');

    await click(treeNode[0]);

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
        t('sbomModule.componentDetails'),
      ],
      assert
    );

    const menuItems = findAll('[data-test-ak-tab-item]');

    await click(menuItems[1].querySelector('a'));

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
        t('sbomModule.componentDetails'),
      ],
      assert
    );
  });

  test('it checks sbom page with table breadcrumbs', async function (assert) {
    assert.expect();

    const tableRow = findAll('[data-test-sbomApp-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
      ],
      assert
    );

    assert.dom('[data-test-sbomscandetails-switch-listviewbutton]').exists();

    await click('[data-test-sbomscandetails-switch-listviewbutton]');

    const sbomComponentTableRow = findAll('[data-test-sbomcomponent-row]');

    await click(sbomComponentTableRow[0]);

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
        t('sbomModule.componentDetails'),
      ],
      assert
    );

    const menuItems = findAll('[data-test-ak-tab-item]');

    await click(menuItems[1].querySelector('a'));

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
        t('sbomModule.componentDetails'),
      ],
      assert
    );
  });

  test('it checks past sbom flow breadcrumbs', async function (assert) {
    assert.expect();

    const tableRow = findAll('[data-test-sbomApp-row]');

    await click(tableRow[0]);

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
      ],
      assert
    );

    assert.dom('[data-test-sbomscandetails-pastsbomanalyses-link]').exists();

    await click('[data-test-sbomscandetails-pastsbomanalyses-link]');

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
        `${t('sbomModule.pastSbomAnalyses')} (${this.files[0].name})`,
      ],
      assert
    );

    const sbomScanTableRow = findAll('[data-test-sbomscan-row]');

    await click(sbomScanTableRow[0]);

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
      ],
      assert
    );
  });

  test('it checks past sbom flow directly from table breadcrumbs', async function (assert) {
    assert.expect();

    const tableActionButton = findAll('[data-test-sbomapp-actionbtn]');

    await click(tableActionButton[0]);

    const sbomActionMenuItem = findAll('[data-test-sbomapp-actionmenuitem]');

    await click(sbomActionMenuItem[0].querySelector('a'));

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.pastSbomAnalyses')} (${this.files[0].name})`,
      ],
      assert
    );

    const sbomScanTableRow = findAll('[data-test-sbomscan-row]');

    await click(sbomScanTableRow[0]);

    assertBreadcrumbsUI(
      [
        t('SBOM'),
        `${t('sbomModule.pastSbomAnalyses')} (${this.files[0].name})`,
        `${t('sbomModule.allComponentsAndVulnerabilities')} (${this.files[0].name})`,
      ],
      assert
    );
  });
});
