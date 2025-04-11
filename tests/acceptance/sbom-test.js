import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  findAll,
  click,
  waitFor,
} from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { faker } from '@faker-js/faker';
import { selectChoose } from 'ember-power-select/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';

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

    const projects = files.map((file, i) =>
      this.server.create('project', {
        last_file_id: file.id,
        platform: i === 2 ? 0 : faker.helpers.arrayElement([0, 1]),
      })
    );

    const sbomFiles = this.server.createList('sbom-file', 5);

    sbomFiles[1].update({
      status: SbomScanStatus.COMPLETED,
    });

    const sbomProjects = sbomFiles.map((sbomFile) =>
      this.server.create('sbom-project', { latest_sb_file: sbomFile.id })
    );

    const sbomComponents = sbomFiles.map((sbomFile) =>
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

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
    this.owner.register('service:notifications', NotificationsStub);

    this.setProperties({
      projects,
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

  test('test sbom scan details', async function (assert) {
    this.sbomFiles[0].update({
      status: SbomScanStatus.COMPLETED,
    });

    this.server.get('/v2/sb_projects/:id/sb_files', (schema) => {
      const results = schema.sbomFiles.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_file_component/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get(
      '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
      (schema) => {
        const results = schema.sbomVulnerabilityAudits.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[0].id}/scans/${this.sbomFiles[0].id}`
    );

    assert.dom('[data-test-sbomScanDetails-container]').exists();

    assert.dom('[data-test-sbomScanDetails-switch-header]').exists();

    assert.dom('[data-test-sbomScanDetails-switch-listViewButton]').exists();

    assert
      .dom('[data-test-sbomScanDetails-switch-treeViewButton]')
      .exists()
      .hasClass(/active/);

    assert
      .dom('[data-test-sbomScanDetails-collapseAllButton]')
      .exists()
      .isDisabled();

    assert.dom('[data-test-component-tree]').exists();

    const nodes = findAll('[data-test-component-tree-node]');

    assert.strictEqual(nodes.length, this.sbomComponents.length);

    const nodeLabels = findAll('[data-test-component-tree-nodeLabel]');

    await click(nodeLabels[0]);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[0].id}/scans/${this.sbomFiles[0].id}/components/${this.sbomComponents[0].id}/0/overview`
    );

    assert
      .dom('[data-test-sbomComponentDetails-headerTitleValue]')
      .containsText(this.sbomComponents[0].name);

    assert
      .dom('[data-test-sbom-component-tree-header]')
      .exists()
      .hasText(t('dependencyTree'));

    assert
      .dom('[data-test-sbomComponentDetails-tab="vulnerabilities"]')
      .exists();

    assert.dom('[data-test-sbomComponentDetails-tab="overview"]').exists();

    assert
      .dom('[data-test-component-tree-nodeLabel]')
      .containsText(this.sbomComponents[0].name)
      .hasClass(/tree-label-highlighted-text/);

    assert.dom('[data-test-component-tree-returnIcon]').exists();

    await click(`[data-test-sbomComponentDetails-tab="vulnerabilities"] a`);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[0].id}/scans/${this.sbomFiles[0].id}/components/${this.sbomComponents[0].id}/0/vulnerabilities`
    );
  });

  test('test sbom scan details for outdated files', async function (assert) {
    this.sbomFiles[1].update({ is_outdated: true });

    this.server.get('/v2/sb_projects/:id/sb_files', (schema) => {
      const results = schema.sbomFiles.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_file_component/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get(
      '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
      (schema) => {
        const results = schema.sbomVulnerabilityAudits.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );

    assert.dom('[data-test-sbomScanDetails-container]').exists();

    assert.dom('[data-test-sbomScanDetails-switch-header]').doesNotExist();

    assert
      .dom('[data-test-sbomScanDetails-switch-listViewButton]')
      .doesNotExist();

    assert
      .dom('[data-test-sbomScanDetails-switch-treeViewButton]')
      .doesNotExist();

    assert.dom('[data-test-component-tree]').doesNotExist();

    const contentRows = findAll('[data-test-sbomComponent-row]');

    await click(contentRows[1]);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${this.sbomComponents[1].id}/0/overview`
    );

    assert
      .dom('[data-test-sbomComponentDetails-headerTitleValue]')
      .containsText(this.sbomComponents[1].name);

    assert
      .dom('[data-test-sbomComponentDetails-tab="vulnerabilities"]')
      .exists();

    assert.dom('[data-test-sbomComponentDetails-tab="overview"]').exists();

    assert.dom('[data-test-sbomScanDetails-componentDetails-summary]').exists();

    assert.dom('[data-test-component-tree]').doesNotExist();

    assert.dom('[data-test-component-tree-node]').doesNotExist();

    assert.dom('[data-test-sbom-component-tree-header]').doesNotExist();

    await click(`[data-test-sbomComponentDetails-tab="vulnerabilities"] a`);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${this.sbomComponents[1].id}/0/vulnerabilities`
    );
  });

  test('test sbom component tree nodes expand collapse', async function (assert) {
    this.sbomComponents[0].update({ dependency_count: 2, is_outdated: false });

    this.server.get('/v2/sb_projects/:id/sb_files', (schema) => {
      const results = schema.sbomFiles.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_file_component/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    const dependencies = this.server.createList('sbom-component', 2, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: true,
    });

    this.server.get('/v2/sb_file_component/:comp_id/dependencies', () => {
      return {
        count: dependencies.length,
        next: null,
        previous: null,
        results: dependencies,
      };
    });

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );

    assert.dom('[data-test-sbomScanDetails-container]').exists();

    assert.dom('[data-test-sbomScanDetails-switch-header]').exists();

    assert.dom('[data-test-sbomScanDetails-switch-listViewButton]').exists();

    assert
      .dom('[data-test-sbomScanDetails-switch-treeViewButton]')
      .exists()
      .hasClass(/active/);

    assert
      .dom('[data-test-sbomScanDetails-collapseAllButton]')
      .exists()
      .isDisabled();

    assert.dom('[data-test-component-tree]').exists();

    const nodes = findAll('[data-test-component-tree-node]');

    assert.notEqual(nodes.length, this.sbomComponents.length);

    // Click to expand
    await click('[data-test-component-tree-nodeExpandIcon]');

    assert.strictEqual(nodes.length, this.sbomComponents.length + 2);

    await waitFor('[data-test-component-tree-nodeCollapseIcon]', {
      timeout: 3000,
    });

    // Click to collapse
    await click('[data-test-component-tree-nodeCollapseIcon]');

    assert.dom('[data-test-component-tree-nodeCollapseIcon]').doesNotExist();

    // Click to expand
    await click('[data-test-component-tree-nodeExpandIcon]');

    assert.dom('[data-test-component-tree-nodeCollapseIcon]').exists();

    // Test collapse all button
    assert
      .dom('[data-test-sbomScanDetails-collapseAllButton]')
      .exists()
      .isNotDisabled();

    await click('[data-test-sbomScanDetails-collapseAllButton]');

    assert.notEqual(nodes.length, this.sbomComponents.length);

    assert.dom('[data-test-sbomScanDetails-collapseAllButton]').isDisabled();
  });

  test('test sbom component tree with parent component loaded from API', async function (assert) {
    const parentComponent = this.server.createList('sbom-component', 1, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: false,
      dependency_count: 2,
      name: 'Parent Component',
      version: '1.0.0',
      latest_version: '1.2.0',
      bom_ref: 'pkg:npm/parent-component@1.0.0',
    });

    const dependencies = this.server.createList('sbom-component', 2, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: true,
    });

    this.server.get('/v2/sb_file_component/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    // Mock API for dependencies
    this.server.get('/v2/sb_file_component/:comp_id/dependencies', () => {
      return {
        count: dependencies.length,
        next: null,
        previous: null,
        results: dependencies,
      };
    });

    // Mock API for parents
    this.server.get('/v2/sb_file_component/:comp_id/parents', () => {
      return {
        count: parentComponent.length,
        next: null,
        previous: null,
        results: parentComponent,
      };
    });

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${dependencies[0].id}/${parentComponent[0].id}/overview`
    );

    assert.dom('[data-test-component-tree]').exists();

    assert.dom('[data-test-component-tree-nodeLabel]').exists();

    // Component should be auto-expanded
    assert.dom('[data-test-component-tree-nodeCollapseIcon]').exists();

    assert.dom('[data-test-component-tree-node]').exists({ count: 3 }); // Parent + 2 children

    const nodeLabels = findAll('[data-test-component-tree-nodeLabel]');

    assert.dom(nodeLabels[0]).containsText(parentComponent[0].name);

    assert
      .dom(nodeLabels[1])
      .containsText(dependencies[0].name)
      .hasClass(/tree-label-highlighted-text/);

    // visit with wrong parent id
    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${dependencies[0].id}/299/overview`
    );

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(
      notify.errorMsg,
      t('sbomModule.parentComponentNotFound')
    );

    // redirect to parent 0
    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${dependencies[0].id}/0/overview`
    );
  });

  test('test sbom component tree with multiple parents', async function (assert) {
    const parentComponent = this.server.createList('sbom-component', 2, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: false,
    });

    const dependencies = this.server.createList('sbom-component', 2, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: true,
    });

    this.server.get('/v2/sb_file_component/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    // Mock API for dependencies
    this.server.get('/v2/sb_file_component/:comp_id/dependencies', () => {
      return {
        count: dependencies.length,
        next: null,
        previous: null,
        results: dependencies,
      };
    });

    // Mock API for parents
    this.server.get('/v2/sb_file_component/:comp_id/parents', () => {
      return {
        count: parentComponent.length,
        next: null,
        previous: null,
        results: parentComponent,
      };
    });

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${dependencies[0].id}/${parentComponent[0].id}/overview`
    );

    assert.dom('[data-test-component-tree]').exists();

    assert.dom('[data-test-component-tree-nodeLabel]').exists();

    assert.dom('[data-test-component-tree-node]').exists({ count: 3 }); // Parent + 2 children

    const nodeLabels = findAll('[data-test-component-tree-nodeLabel]');

    assert.dom(nodeLabels[0]).containsText(parentComponent[0].name);

    assert
      .dom(nodeLabels[1])
      .containsText(dependencies[0].name)
      .hasClass(/tree-label-highlighted-text/);

    assert
      .dom('[data-test-sbom-component-tree-multiple-parents-header]')
      .exists()
      .containsText(t('multipleParents'));

    assert
      .dom('[data-test-sbom-component-tree-multiple-parents-link]')
      .exists()
      .containsText(parentComponent[1].name);

    await click('[data-test-sbom-component-tree-multiple-parents-link]');

    assert.dom('[data-test-sbomcomponentdetails-container]').exists();

    assert
      .dom('[data-test-sbomcomponentdetails-headertitlevalue]')
      .exists()
      .containsText(parentComponent[1].name);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${parentComponent[1].id}/0/overview`
    );
  });

  test('test sbom component tree with third level children', async function (assert) {
    // Set up the hierarchy: Root -> Level 2 -> Level 3
    const rootComponent = this.server.createList('sbom-component', 1, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: false,
      dependency_count: 2,
      is_outdated: false,
      name: 'Root Component',
    });

    // Level 2 dependencies
    const level2Dependencies = this.server.createList('sbom-component', 2, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: true,
      dependency_count: 2,
      name: 'Level 2 Component',
    });

    // Level 3 dependencies
    const level3Dependencies = this.server.createList('sbom-component', 2, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: true,
      dependency_count: 0,
      name: 'Level 3 Component',
    });

    this.server.get('/v2/sb_files/:id/sb_file_components', () => {
      return {
        count: rootComponent.length,
        next: null,
        previous: null,
        results: rootComponent,
      };
    });

    this.server.get(
      '/v2/sb_file_component/:comp_id/dependencies',
      (schema, request) => {
        const componentId = request.params.comp_id;

        if (componentId == rootComponent[0].id) {
          return {
            count: level2Dependencies.length,
            next: null,
            previous: null,
            results: level2Dependencies,
          };
        } else {
          return {
            count: level3Dependencies.length,
            next: null,
            previous: null,
            results: level3Dependencies,
          };
        }
      }
    );

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );

    assert.dom('[data-test-component-tree]').exists();

    assert
      .dom('[data-test-component-tree-nodeLabel]')
      .exists()
      .containsText('Root Component');

    assert.dom('[data-test-component-tree-nodeExpandIcon]').exists();

    await click('[data-test-component-tree-nodeExpandIcon]');

    const nodes = findAll('[data-test-component-tree-node]');

    assert.strictEqual(nodes.length, 3); // Root + 2 level 2

    const expandButtons = findAll('[data-test-component-tree-nodeExpandIcon]');

    await click(expandButtons[1]);

    const newNodes = findAll('[data-test-component-tree-node]');

    assert.strictEqual(newNodes.length, 5); // Root + 2 level 2 + 2 level 3
  });

  test('test sbom component tree "View More" for children', async function (assert) {
    const rootComponent = this.server.createList('sbom-component', 1, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: false,
      dependency_count: 20,
      is_outdated: false,
      name: 'Root Component',
    });

    // Initial batch of dependencies (first 15)
    const initialDependencies = this.server.createList('sbom-component', 15, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: true,
      parentId: this.sbomComponents[0].id,
    });

    // Second batch of dependencies (next 5)
    const moreDependencies = this.server.createList('sbom-component', 5, {
      sb_file: this.sbomFiles[1].id,
      is_dependency: true,
      parentId: this.sbomComponents[0].id,
      name: (i) => `More Dependency ${i}`,
    });

    const BATCH_SIZE = 15;

    this.server.get('/v2/sb_files/:id/sb_file_components', () => {
      return {
        count: rootComponent.length,
        next: null,
        previous: null,
        results: rootComponent,
      };
    });

    this.server.get(
      '/v2/sb_file_component/:comp_id/dependencies',
      (schema, request) => {
        const requestOffset = parseInt(request.queryParams.offset) || 0;
        const limit = BATCH_SIZE;

        const allDependencies = [...initialDependencies, ...moreDependencies];
        const results = allDependencies.slice(
          requestOffset,
          requestOffset + limit
        );

        return {
          count: allDependencies.length,
          next: requestOffset + limit < allDependencies.length ? 'next' : null,
          previous: null,
          results: results,
        };
      }
    );

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );

    await click('[data-test-component-tree-nodeExpandIcon]');

    const nodes = findAll('[data-test-component-tree-node]');

    assert.strictEqual(nodes.length, 16); // Root + 15 children

    assert.dom('[data-test-component-tree-child-viewMore]').exists();

    await click('[data-test-component-tree-child-viewMore]');

    const newNodes = findAll('[data-test-component-tree-node]');

    assert.strictEqual(newNodes.length, 21); // Root + 15 + 5 more
  });

  test('it triggers sbom scan component details route on row click', async function (assert) {
    this.server.createList('sbom-vulnerability-audit', 3);

    this.server.get('/v2/sb_file_component/:id', (schema, req) =>
      schema.sbomComponents.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get(
      '/v2/sb_file_component/:comp_id/sb_vulnerability_audits',
      (schema) => {
        const results = schema.sbomVulnerabilityAudits.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    await visit(
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}`
    );

    assert.dom('[data-test-sbomScanDetails-switch-listViewButton]').exists();

    await click('[data-test-sbomScanDetails-switch-listViewButton]');

    const contentRows = findAll('[data-test-sbomComponent-row]');

    await click(contentRows[1]);

    assert.strictEqual(
      currentURL(),
      `/dashboard/sbom/apps/${this.sbomProjects[1].id}/scans/${this.sbomFiles[1].id}/components/${this.sbomComponents[1].id}/0/overview`
    );

    assert
      .dom('[data-test-sbomComponentDetails-tab="vulnerabilities"]')
      .exists();

    assert.dom('[data-test-sbomComponentDetails-tab="overview"]').exists();
  });

  test('test search in sbom app list', async function (assert) {
    this.server.get('/v2/sb_projects', (schema, req) => {
      this.set('query', req.queryParams.q);

      const results = this.query
        ? schema.projects.where((p) =>
            p.package_name.toLowerCase().includes(this.query)
          ).models
        : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit(
      `/dashboard/sbom/apps?app_query=${this.projects[0].package_name}`
    );

    let projectContainerList = findAll('[data-test-sbomapp-row]');

    assert.strictEqual(
      projectContainerList.length,
      1,
      'Contains correct number of sbom table rows matching search query.'
    );
  });

  test('It filters sbom project list when platform value changes', async function (assert) {
    this.server.get('/v2/sb_projects', (schema, req) => {
      const platform = req.queryParams.platform;

      this.set('platform', platform);

      const results =
        platform && parseInt(platform) !== -1
          ? schema.projects.where((p) => p.platform === parseInt(platform))
              .models
          : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit(`/dashboard/sbom/apps`);

    let projectContainerList = findAll('[data-test-sbomapp-row]');

    assert.strictEqual(
      projectContainerList.length,
      this.projects.length,
      'Contains correct number of sbom table rows.'
    );

    await clickTrigger('[data-test-select-platform-container]');

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    assert.strictEqual(this.platform, '0');

    projectContainerList = findAll('[data-test-sbomapp-row]');

    assert.strictEqual(
      this.projects.filter((p) => p.platform === 0).length,
      projectContainerList.length,
      'Sbom list items all have platform values matching "0".'
    );

    // Selecting a platform value equal to 1 from the plaform filter options
    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      2
    );

    assert.strictEqual(this.platform, '1');

    projectContainerList = findAll('[data-test-sbomapp-row]');

    assert.strictEqual(
      this.projects.filter((p) => p.platform === 1).length,
      projectContainerList.length,
      'Sbom list items all have platform values matching "1".'
    );

    // Selecting a platform value equal to -1 from the plaform filter options
    // This should return the entire sbom list
    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      0
    );

    assert.strictEqual(typeof this.platform, 'undefined');

    projectContainerList = findAll('[data-test-sbomapp-row]');

    assert.strictEqual(
      this.projects.length,
      projectContainerList.length,
      'Sbom list defaults to complete list when platform value is "-1".'
    );
  });

  test('It clears filter after filter is applied', async function (assert) {
    this.server.get('/v2/sb_projects', (schema, req) => {
      const platform = req.queryParams.platform;

      this.set('platform', platform);

      const results =
        platform && parseInt(platform) !== -1
          ? schema.projects.where((p) => p.platform === parseInt(platform))
              .models
          : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit(`/dashboard/sbom/apps`);

    assert.dom('[data-test-sbom-list-header-clear-filter]').doesNotExist();

    await clickTrigger('[data-test-select-platform-container]');

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    assert.dom('[data-test-sbom-list-header-clear-filter]').exists();

    // Clear Filter
    await click('[data-test-sbom-list-header-clear-filter]');

    assert.dom('[data-test-sbom-list-header-clear-filter]').doesNotExist();
  });
});
