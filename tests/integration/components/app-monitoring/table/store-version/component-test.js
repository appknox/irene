import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | app-monitoring/table/store-version',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.file = this.server.create('file');
      this.latestAmAppVersion = this.server.create('am-app-version', {
        latestFile: this.file,
      });

      this.lastSync = this.server.create('am-app-sync');
      this.project = this.server.create('project', {
        lastFile: this.file,
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
      });
    });

    test('it renders "NOT FOUND" status in store version column if comparableVersion is empty and latestAmAppVersion is null', async function (assert) {
      this.latestAmAppVersion = this.server.create('am-app-version', {
        comparableVersion: '',
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: null,
        lastSync: this.lastSync,
        isActive: true,
      });

      await render(
        hbs`<AppMonitoring::Table::StoreVersion @amApp={{this.amApp}}  />`
      );

      assert
        .dom('[data-test-am-table-row-store-version]')
        .containsText('t:notFound:()');
    });

    test('it renders "PENDING" status in store version column if comparableVersion is empty and lastSync are null', async function (assert) {
      this.latestAmAppVersion = this.server.create('am-app-version', {
        comparableVersion: '',
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        lastSync: null,
        isActive: true,
      });

      await render(
        hbs`
        <AppMonitoring::Table::StoreVersion
          @amApp={{this.amApp}}
        />`
      );

      assert
        .dom(
          '[data-test-am-table-row-store-version] [data-test-am-status-element]'
        )
        .containsText('t:pending:()');
    });

    test('it renders  "NOT SCANNED" status when latestFile in latestAmAppVersion is null', async function (assert) {
      this.latestAmAppVersion = this.server.create('am-app-version', {
        latestFile: null,
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        lastSync: this.lastSync,
        isActive: true,
      });

      await render(
        hbs`
        <AppMonitoring::Table::StoreVersion
          @amApp={{this.amApp}}
        />`
      );

      assert
        .dom('[data-test-am-table-row-store-version]')
        .containsText(`${this.amApp.latestAmAppVersion.comparableVersion}`)
        .containsText(`t:notScanned:()`);

      assert
        .dom(
          '[data-test-am-table-row-store-version] [data-test-am-status-element]'
        )
        .exists()
        .containsText(`t:notScanned:()`);
    });
  }
);
