import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module(
  'Integration | Component | app-monitoring/history-table/scanned-status',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.store = this.owner.lookup('service:store');

      // File Record
      const file = this.server.create('file', 1);

      // Project Record
      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      // AmAppVersion
      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: file.id,
      });

      // AmApp Record.
      const amApp = this.server.create('am-app', {
        id: 1,
        latest_file: file.id,
        project: project.id,
        latest_am_app_version: amAppVersion.id,
      });

      this.setProperties({
        amApp,
        file,
        project,
      });

      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
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
    });

    test('it renders "YES" as scannned status text if amApp is "SCANNED"', async function (assert) {
      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return {
          ...schema.amApps.find(`${req.params.id}`)?.toJSON(),
          last_sync: this.amAppSync.id,
        };
      });

      // AmAppVersion for a "SCANNED" amApp
      const amAppSync = this.server.create('am-app-sync', {
        id: 1,
        am_app: this.amApp.id,
      });

      const normalizedAmAppSync = this.store.normalize(
        'am-app-sync',
        amAppSync.toJSON()
      );

      this.amAppSync = this.store.push(normalizedAmAppSync);

      await render(
        hbs`<AppMonitoring::HistoryTable::ScannedStatus @amAppSync={{this.amAppSync}} />`
      );

      assert
        .dom('[data-test-history-table-scanned-status]')
        .exists()
        .containsText('t:yes:()');
    });

    test('it renders "NO" as scannned status text if amApp is "NOT SCANNED"', async function (assert) {
      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return {
          ...schema.amApps.find(`${req.params.id}`)?.toJSON(),
          last_sync: this.amAppSync.id,
        };
      });

      // AmAppVersion for a "NOT SCANNED" amApp
      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: null,
      });

      // AmApp Record.
      const amApp = this.server.create('am-app', {
        id: 1,
        latest_file: this.file.id,
        project: this.project.id,
        latest_am_app_version: amAppVersion.id,
      });

      const amAppSync = this.server.create('am-app-sync', {
        id: 1,
        am_app: amApp.id,
      });

      const normalizedAmAppSync = this.store.normalize(
        'am-app-sync',
        amAppSync.toJSON()
      );

      this.amAppSync = this.store.push(normalizedAmAppSync);

      await render(
        hbs`<AppMonitoring::HistoryTable::ScannedStatus @amAppSync={{this.amAppSync}} />`
      );

      assert
        .dom('[data-test-history-table-scanned-status]')
        .exists()
        .containsText('t:no:()');
    });

    test('it renders "-" if amApp is neither "SCANNED" nor "NOT SCANNED"', async function (assert) {
      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return {
          ...schema.amApps.find(`${req.params.id}`)?.toJSON(),
          last_sync: this.amAppSync.id,
        };
      });

      // AmApp Record.
      const amApp = this.server.create('am-app', {
        id: 1,
        latest_file: this.file.id,
        project: this.project.id,
        latest_am_app_version: null,
      });

      const amAppSync = this.server.create('am-app-sync', {
        id: 1,
        am_app: amApp.id,
      });

      const normalizedAmAppSync = this.store.normalize(
        'am-app-sync',
        amAppSync.toJSON()
      );

      this.amAppSync = this.store.push(normalizedAmAppSync);

      await render(
        hbs`<AppMonitoring::HistoryTable::ScannedStatus @amAppSync={{this.amAppSync}} />`
      );

      assert
        .dom('[data-test-history-table-scanned-status]')
        .exists()
        .containsText('-');
    });
  }
);
