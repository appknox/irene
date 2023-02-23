import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
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
    this.lastFile = this.server.create('file');
    this.latestAmAppVersion = this.server.create('am-app-version', 1);
    this.amAppSyncs = this.server.createList('am-app-sync', 1);
    this.project = this.server.create('project', {
      lastFile: this.lastFile,
    });

    this.amApps = this.server.createList('am-app', 5, {
      project: this.project,
      latestAmAppVersion: this.latestAmAppVersion,
    });
  });

  test('it should show only table headers and no-content message for enabled settings state if table data is less than one', async function (assert) {
    this.owner.register('service:organization', OrganizationStub);

    this.set('settings', {
      id: 1,
      enabled: true,
    });

    this.server.get('v2/am_apps', () => {
      return [];
    });

    this.owner.lookup('service:appmonitoring');

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);
    assert.dom(`[data-test-am-table-container]`).exists();
    assert.dom(`[data-test-am-table-header]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-am-table-header] tr th`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-am-error-container]').exists();
    assert.dom('[data-test-am-error-illustration]').exists();
    assert
      .dom('[data-test-am-error-container]')
      .containsText('t:appMonitoringErrors.emptyResults.header:()')
      .containsText('t:appMonitoringErrors.emptyResults.body:()');
  });

  test('it should show table rows if settings is enabled and table data is more than zero', async function (assert) {
    this.owner.register('service:organization', OrganizationStub);

    this.set('settings', {
      id: 1,
      enabled: true,
    });

    this.server.get('v2/am_apps', (schema) => {
      return schema['amApps'].all().models;
    });

    const amApps = this.server.db.amApps;

    class AppMonitoringStub extends Service {
      offset = 10;
      limit = 10;

      appMonitoringData = amApps;
    }

    this.owner.register('service:appmonitoring', AppMonitoringStub);

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);
    assert.dom(`[data-test-am-table-container]`).exists();
    assert.dom(`[data-test-am-table-header]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-am-table-header] tr th`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-am-error-container]').doesNotExist();
    assert.dom('[data-test-am-table-body]').exists();
    assert.dom('[data-test-am-table-row]').exists();
    assert.strictEqual(
      this.element.querySelectorAll('[data-test-am-table-row]').length,
      5,
      'Should have five (5) scanned projects - [data-test-am-table-row]'
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
    assert.dom(`[data-test-am-table-container]`).exists();
    assert.dom(`[data-test-am-table-header]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-am-table-header] tr th`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-am-error-container]').exists();
    assert.dom('[data-test-am-error-illustration]').exists();
    assert
      .dom('[data-test-am-error-container]')
      .containsText('t:appMonitoringErrors.noOrgProjects.header:()')
      .containsText('t:appMonitoringErrors.noOrgProjects.body:()');
  });
});
