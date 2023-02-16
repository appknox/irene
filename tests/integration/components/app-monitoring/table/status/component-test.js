import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | app-monitoring/table/status',
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

      this.settings = {
        id: 1,
        enabled: true,
      };
    });

    test('It renders "INACTIVE" in status column if isActive is false', async function (assert) {
      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        isActive: false,
      });

      this.settings.enabled = false;

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}} @settings={{this.settings}} />`
      );

      assert
        .dom(`[data-test-am-table-row-status]`)
        .exists()
        .containsText(`t:inactiveCaptital:()`);
    });

    test('It renders "ACTIVE" in status column if settings is enabled and isActive is enabled', async function (assert) {
      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        isActive: true,
      });

      this.settings.enabled = true;

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}}  @settings={{this.settings}} />`
      );

      assert
        .dom('[data-test-am-table-row-status]')
        .containsText('t:activeCaptital:()');
    });

    test('it hides "sync in progress" status column when store monitoring is inactive and status is "PENDING"', async function (assert) {
      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
        latestAmAppVersion: this.latestAmAppVersion,
        lastSync: null,
        isActive: false,
      });

      this.settings.enabled = false;

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}}  @settings={{this.settings}} />`
      );

      assert
        .dom(`[data-test-am-table-row-status]`)
        .containsText(`t:inactiveCaptital:()`);

      assert.dom('[data-test-am-table-row-last-sync-spinner]').doesNotExist();
    });
  }
);
