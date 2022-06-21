import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | app-monitoring/table/row', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.lastFile = this.server.create('file');
    this.latest_am_app_version = this.server.create(
      'app-monitoring/am-app-version'
    );
    this.am_app_syncs = this.server.createList('app-monitoring/am-app-sync', 2);
    this.project = this.server.create('project', {
      lastFile: this.lastFile,
    });

    this.amApp = this.server.create('app-monitoring/am-app', 1, {
      project: this.project,
      latest_am_app_version: this.latest_am_app_version,
    });
  });

  test('It renders with the right row data', async function (assert) {
    await render(hbs`<AppMonitoring::Table::Row @amApp={{this.amApp}} />`);

    assert.strictEqual(
      this.element.querySelectorAll('[data-test-table-row-item]').length,
      5,
      'It has five row items'
    );

    assert
      .dom(`[data-test-table-row-app-namespace]`)
      .containsText(this.amApp.project.packageName);

    assert
      .dom(`[data-test-table-row-app-name]`)
      .containsText(this.amApp.project.lastFile.name);

    assert
      .dom(`[data-test-table-row-prod-version]`)
      .hasText(`${this.amApp.latest_am_app_version.version}`);

    assert
      .dom(`[data-test-table-row-platform=${this.amApp.platform}]`)
      .exists();

    assert
      .dom(`[data-test-table-row-version]`)
      .hasText(`${this.amApp.project.lastFile.version}`);
  });

  test('It renders with the right row status', async function (assert) {
    this.amApp = this.server.create('app-monitoring/am-app', 1, {
      project: this.project,
      latest_am_app_version: this.latest_am_app_version,
      monitoring_enabled: true,
    });

    await render(hbs`<AppMonitoring::Table::Row @amApp={{this.amApp}} />`);

    assert.strictEqual(
      this.element.querySelectorAll('[data-test-table-row-item]').length,
      5,
      'It has five row items'
    );

    assert.dom(`[data-test-table-row-status]`).hasText(`is active`);

    this.amApp = this.server.create('app-monitoring/am-app', 1, {
      project: this.project,
      latest_am_app_version: null,
      am_app_syncs: [],
    });

    await render(hbs`<AppMonitoring::Table::Row @amApp={{this.amApp}} />`);
    assert.dom(`[data-test-table-row-status]`).hasText(`pending`);
  });

  test('It renders a status of "not-found" when app-syncs is not empty', async function (assert) {
    this.amApp = this.server.create('app-monitoring/am-app', 1, {
      project: this.project,
      latest_am_app_version: null,
      monitoring_enabled: true,
      am_app_syncs: this.am_app_syncs,
    });

    await render(hbs`<AppMonitoring::Table::Row @amApp={{this.amApp}} />`);
    assert.dom(`[data-test-table-row-status]`).hasText(`not found`);
  });
});
