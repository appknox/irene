import { module, test } from 'qunit';
import { visit, fillIn, findAll, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { faker } from '@faker-js/faker';
import {
  clickTrigger,
  selectChoose,
} from 'ember-power-select/test-support/helpers';
import Service from '@ember/service';

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

module('Acceptance | Component | app-monitoring-settings', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization } = await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);

    organization.update({
      features: {
        app_monitoring: true,
      },
    });

    const files = this.server.createList('file', 5);

    const projects = files.map((file, i) =>
      this.server.create('project', {
        last_file_id: file.id,
        platform: i === 2 ? 0 : faker.helpers.arrayElement([0, 1]),
      })
    );

    const latestAmAppVersions = files.map((file) =>
      this.server.create('am-app-version', { latest_file: file.id })
    );

    this.server.get('organizations/:id/am_configuration', (schema, req) => {
      return { id: 1, enabled: false, organization: req.params.id };
    });

    const amApps = projects.map((project, idx) => {
      this.server.create('am-app', {
        project: project.id,
        latest_am_app_version: latestAmAppVersions[idx].id,
      });
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return {
        ...schema.files.find(`${req.params.id}`)?.toJSON(),
        project: req.params.id,
      };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_apps/:id/latest_versions', (schema) => {
      const results = schema.amAppVersions.all().models;

      return { count: 0, next: null, previous: null, results };
    });

    this.setProperties({
      amApps,
      projects,
    });
  });

  test('It searches in app monitoring list', async function (assert) {
    this.server.get('/v2/am_apps', (schema, req) => {
      this.set('query', req.queryParams.q);
      const results = this.query
        ? schema.projects.where((p) =>
            p.package_name.toLowerCase().includes(this.query)
          ).models
        : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit(`/dashboard/store-monitoring`);

    let amAppsTableRows = findAll('[data-test-am-table-row]');

    assert.strictEqual(
      amAppsTableRows.length,
      this.amApps.length,
      `should have five (${this.amApps.length}) scanned projects - [data-test-am-table-row]`
    );

    await fillIn(
      '[data-test-search-query-input]',
      this.projects[0].package_name
    );

    amAppsTableRows = findAll('[data-test-am-table-row]');

    assert.dom('[data-test-am-table-row]').exists();

    assert.strictEqual(
      amAppsTableRows.length,
      1,
      'Contains correct number of rows matching search query.'
    );
  });

  test('It filters app monitoring list when platform value changes', async function (assert) {
    this.server.get('/v2/am_apps', (schema, req) => {
      const platform = req.queryParams.platform;

      this.set('platform', platform);

      const results =
        platform && parseInt(platform) !== -1
          ? schema.projects.where((p) => p.platform === parseInt(platform))
              .models
          : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit(`/dashboard/store-monitoring`);

    await clickTrigger('[data-test-select-platform-container]');

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    let amAppsTableRows = findAll('[data-test-am-table-row]');

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      2
    );

    assert.strictEqual(this.platform, '1');

    amAppsTableRows = findAll('[data-test-am-table-row]');

    assert.strictEqual(
      this.projects.filter((p) => p.platform === 1).length,
      amAppsTableRows.length,
      'Store Monitoring List all have platform values matching "1".'
    );

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      0
    );

    assert.strictEqual(typeof this.platform, 'undefined');

    amAppsTableRows = findAll('[data-test-am-table-row]');

    assert.strictEqual(
      this.projects.length,
      amAppsTableRows.length,
      'Store Monitoring List defaults to complete list when platform value is "-1".'
    );
  });

  test('It clears filter after filter is applied', async function (assert) {
    this.server.get('/v2/am_apps', (schema, req) => {
      const platform = req.queryParams.platform;

      this.set('platform', platform);

      const results =
        platform && parseInt(platform) !== -1
          ? schema.projects.where((p) => p.platform === parseInt(platform))
              .models
          : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await visit(`/dashboard/store-monitoring`);

    assert
      .dom('[data-test-app-monitoring-settings-clear-filter]')
      .doesNotExist();

    await clickTrigger('[data-test-select-platform-container]');

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    assert.dom('[data-test-app-monitoring-settings-clear-filter]').exists();

    // Clear Filter
    await click('[data-test-app-monitoring-settings-clear-filter]');

    assert
      .dom('[data-test-app-monitoring-settings-clear-filter]')
      .doesNotExist();
  });
});
