import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | app-monitoring/table', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.lastFile = this.server.create('file');
    this.latest_am_app_version = this.server.create(
      'app-monitoring/am-app-version',
      1
    );
    this.am_app_syncs = this.server.createList('app-monitoring/am-app-sync', 2);
    this.project = this.server.create('project', {
      lastFile: this.lastFile,
    });

    this.amApps = this.server.createList('app-monitoring/am-app', 5, {
      project: this.project,
      latest_am_app_version: this.latest_am_app_version,
    });
  });

  test('it should show only table headers and no-content message for disabled settings state', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: false,
    });

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);
    assert.dom(`[data-test-production-scan-table]`).exists();
    assert.dom(`[data-test-table-header-container]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-table-header]`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-empty-prod-data-container]').exists();
    assert.dom('[data-test-empty-prod-data-illustration]').exists();
    assert
      .dom('[data-test-empty-prod-data-container]')
      .containsText('t:productionScanDisabledDesc.header:()')
      .containsText('t:productionScanDisabledDesc.body:()');
  });

  test('it should show only table headers and no-content message for enabled settings state if table data is less than one', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);
    assert.dom(`[data-test-production-scan-table]`).exists();
    assert.dom(`[data-test-table-header-container]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-table-header]`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-empty-prod-data-container]').exists();
    assert.dom('[data-test-empty-prod-data-illustration]').exists();
    assert
      .dom('[data-test-empty-prod-data-container]')
      .containsText('t:productionScanEmptyDesc.header:()')
      .containsText('t:productionScanEmptyDesc.body:()');
  });

  test('it should show table rows if settings is enabled and table data is more than zero', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    this.server.get('v2/am_apps', (schema) => {
      return schema['appMonitoring/amApps'].all().models;
    });

    await render(hbs`<AppMonitoring::Table @settings={{this.settings}}  />`);
    assert.dom(`[data-test-production-scan-table]`).exists();
    assert.dom(`[data-test-table-header-container]`).exists();
    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-table-header]`).length,
      5,
      'Should have five (5) table headers'
    );
    assert.dom('[data-test-empty-prod-data-container]').doesNotExist();
    assert.dom('[data-test-prod-scan-table-body]').exists();
    assert.dom('[data-test-table-row]').exists();
    assert.strictEqual(
      this.element.querySelectorAll('[data-test-table-row]').length,
      5,
      'Should have five (5) scanned projects - [data-test-table-row]'
    );
  });
});
