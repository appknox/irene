import Service from '@ember/service';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

class OrganizationStub extends Service {
  selected = {
    id: 1,
    projectsCount: 1,
  };
}

module('Integration | Component | app-monitoring/table', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const files = this.server.createList('file', 5);

    const projects = files.map((file) =>
      this.server.create('project', { last_file_id: file.id })
    );

    const relevantAmAppVersions = files.map((file) =>
      this.server.create('am-app-version', { latest_file: file.id })
    );

    const amApps = projects.map((project, idx) => {
      const amApp = this.server.create('am-app', {
        project: project.id,
        relevant_am_app_version: relevantAmAppVersions[idx].id,
      });

      const normalized = store.normalize('am-app', amApp.toJSON());

      return store.push(normalized);
    });

    this.setProperties({
      amApps,
    });

    // Server mocks
    this.server.get('/v2/files/:id', (schema, req) => {
      return {
        ...schema.files.find(`${req.params.id}`)?.toJSON(),
        project: req.params.id,
      };
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_app_versions/:id', (schema, req) => {
      return schema.amAppVersions.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_app_syncs/:id', (schema, req) => {
      return schema.amAppSyncs.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_apps/:id', (schema, req) => {
      return schema.amApps.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/am_apps/:id/latest_versions', (schema) => {
      const results = schema.amAppVersions.all().models;

      return { count: 0, next: null, previous: null, results };
    });
  });

  test('it should show only table headers and no-content message for enabled settings state if amApps data is empty', async function (assert) {
    this.owner.register('service:organization', OrganizationStub);

    this.set('settings', {
      id: 1,
      enabled: true,
    });

    const amApps = [];

    class AppMonitoringStub extends Service {
      offset = 10;
      limit = 10;

      appMonitoringData = amApps;
    }

    this.owner.register('service:appmonitoring', AppMonitoringStub);

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);

    assert.dom(`[data-test-am-tableContainer]`).exists();

    assert.dom(`[data-test-amTable-header]`).exists();

    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-amTable-header] tr th`).length,
      5,
      'Should have five (5) table headers'
    );

    assert.dom('[data-test-am-errorContainer]').exists();

    assert.dom('[data-test-am-errorIllustration]').exists();

    assert
      .dom('[data-test-am-errorContainer]')
      .containsText(t('appMonitoringMessages.emptyResults.header'))
      .containsText(t('appMonitoringMessages.emptyResults.body'));
  });

  test('it should show table rows if settings is enabled and atleast one amApp exists', async function (assert) {
    this.owner.register('service:organization', OrganizationStub);

    this.set('settings', {
      id: 1,
      enabled: true,
    });

    const amApps = this.amApps;

    class AppMonitoringStub extends Service {
      offset = 10;
      limit = 10;

      appMonitoringData = amApps;
    }

    this.owner.register('service:appmonitoring', AppMonitoringStub);

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);

    assert.dom(`[data-test-am-tableContainer]`).exists();

    assert.dom('[data-test-am-errorContainer]').doesNotExist();

    assert.dom('[data-test-am-table-body]').exists();

    assert.dom('[data-test-am-table-row]').exists();

    const amAppsTableRows = findAll('[data-test-am-table-row]');

    assert.strictEqual(
      amAppsTableRows.length,
      this.amApps.length,
      `should have five (${this.amApps.length}) scanned projects - [data-test-am-table-row]`
    );

    // Check the cells of the first row
    const rowCells = amAppsTableRows[0].querySelectorAll(
      '[data-test-am-table-cell]'
    );

    assert
      .dom(rowCells[1])
      .containsText(`${this.amApps[0].get('project').get('packageName')}`)
      .containsText(
        `${this.amApps[0].get('project').get('lastFile').get('name')}`
      );

    assert
      .dom(rowCells[2])
      .containsText(
        `${this.amApps[0].get('relevantAmAppVersion').get('comparableVersion')}`
      );

    assert
      .dom(rowCells[3])
      .containsText(
        `${this.amApps[0]
          .get('project')
          .get('lastFile')
          .get('comparableVersion')}`
      );

    assert
      .dom(rowCells[4])
      .containsText(
        `${this.amApps[0].isActive ? t('activeCapital') : t('inactiveCapital')}`
      );
  });

  test('it should show empty message when no org projects exist', async function (assert) {
    class OrganizationStub extends Service {
      selected = {
        id: 1,
        projectsCount: 0,
      };
    }
    this.owner.register('service:organization', OrganizationStub);

    this.set('settings', {
      id: 1,
      enabled: false,
    });

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);

    assert.dom(`[data-test-am-tableContainer]`).exists();

    assert.dom('[data-test-am-errorContainer]').exists();

    assert.dom('[data-test-am-errorIllustration]').exists();

    assert
      .dom('[data-test-am-errorContainer]')
      .containsText(t('appMonitoringMessages.noOrgProjects.header'))
      .containsText(t('appMonitoringMessages.noOrgProjects.body'));
  });
});
