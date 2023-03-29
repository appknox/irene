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
      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return schema.amApps.find(`${req.params.id}`)?.toJSON();
      });

      // Records
      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      const latestAmAppVersion = this.server.create('am-app-version', {
        latest_file: file.id,
      });

      this.setProperties({
        store,
        file,
        project,
        latestAmAppVersion,
      });
    });

    test('It renders "INACTIVE" in status column if isActive is false', async function (assert) {
      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        latest_am_app_version: this.latestAmAppVersion.id,
        is_active: false,
      });

      const normalized = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalized);

      this.settings = { enabled: false };

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}} @settings={{this.settings}} />`
      );

      assert
        .dom(`[data-test-am-table-row-status]`)
        .exists()
        .containsText(`t:inactiveCapital:()`);
    });

    test('It renders "ACTIVE" in status column if settings is enabled and isActive is enabled', async function (assert) {
      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        latest_am_app_version: this.latestAmAppVersion.id,
        is_active: true,
      });

      const normalized = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalized);

      this.settings = { enabled: true };

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}}  @settings={{this.settings}} />`
      );

      assert
        .dom('[data-test-am-table-row-status]')
        .containsText('t:activeCapital:()');
    });

    test('it hides "sync in progress" status column when store monitoring is inactive and status is "PENDING"', async function (assert) {
      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        latest_am_app_version: this.latestAmAppVersion.id,
        last_sync: null,
        is_active: false,
      });

      const normalized = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalized);

      this.settings = { enabled: false };

      await render(
        hbs`<AppMonitoring::Table::Status @amApp={{this.amApp}}  @settings={{this.settings}} />`
      );

      assert
        .dom(`[data-test-am-table-row-status]`)
        .containsText(`t:inactiveCapital:()`);

      assert.dom('[data-test-am-table-row-last-sync-spinner]').doesNotExist();
    });
  }
);
