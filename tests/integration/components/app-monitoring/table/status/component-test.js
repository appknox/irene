import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';

import { module, test } from 'qunit';

module(
  'Integration | Component | app-monitoring/table/status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.lastFile = this.server.create('file');
      this.latestAmAppVersion = this.server.create('am-app-version');
      this.lastSync = this.server.create('am-app-sync');
      this.project = this.server.create('project', {
        lastFile: this.lastFile,
      });

      this.set('settings', {
        id: 1,
        enabled: true,
      });
    });

    test('it renders "ACTIVE" when app monitoring is enabled and @columnName is not "storeVersion"', async function (assert) {
      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        monitoringEnabled: true,
      });

      await render(
        hbs`<AppMonitoring::Table::Status  @amApp={{this.amApp}} @settings={{this.settings}} />`
      );

      assert.dom(`[data-test-am-status=active]`).exists();
      assert.dom(`[data-test-am-status=active]`).hasText('active');
    });

    test('it renders "INACTIVE" when latest app monitoring is disabled or settings is disabled', async function (assert) {
      this.set('settings', {
        id: 1,
        enabled: false,
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: null,
        lastSync: this.lastSync,
        monitoringEnabled: true,
      });

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}}  @settings={{this.settings}} />`
      );

      assert.dom(`[data-test-am-status=inactive]`).exists();
      assert.dom(`[data-test-am-status=inactive]`).hasText('inactive');

      this.set('settings', {
        id: 1,
        enabled: true,
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: null,
        lastSync: this.lastSync,
        monitoringEnabled: false,
      });

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}}  @settings={{this.settings}} />`
      );

      assert.dom(`[data-test-am-status=inactive]`).exists();
      assert.dom(`[data-test-am-status=inactive]`).hasText('inactive');
    });

    test('it renders "PENDING" if comparableVersion is empty and lastSync are null and @columnName is "storeVersion"', async function (assert) {
      this.latestAmAppVersion = this.server.create('am-app-version', {
        comparableVersion: '',
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        lastSync: null,
        monitoringEnabled: true,
      });

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}} @columnName="storeVersion" />`
      );

      assert.dom(`[data-test-am-status=pending]`).exists();
      assert.dom(`[data-test-am-status=pending]`).hasText('pending');
    });

    test('it renders "NOT FOUND" if comparableVersion is empty and latestAmAppVersion is null and @columnName is "storeVersion"', async function (assert) {
      this.latestAmAppVersion = this.server.create('am-app-version', {
        comparableVersion: '',
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: null,
        lastSync: this.lastSync,
        monitoringEnabled: true,
      });

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}} @columnName="storeVersion" />`
      );

      assert.dom(`[data-test-am-status=not-found]`).exists();
      assert.dom(`[data-test-am-status=not-found]`).hasText('not found');
    });
  }
);
