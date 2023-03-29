import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module(
  'Integration | Component | app-monitoring/details-table/store-version',

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

      // AmAppSync Record
      const amAppSync = this.server.create('am-app-sync', {
        id: 1,
        latest_file: file.id,
      });

      // AmApp Record.
      const amApp = this.server.create('am-app', {
        id: 1,
        latest_file: file.id,
        project: project.id,
        last_sync: amAppSync.id,
      });

      this.setProperties({
        amApp,
        file,
        project,
        amAppSync,
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
    });

    test('it renders correctly when amApp is "SCANNED"', async function (assert) {
      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return {
          ...schema.amApps.find(`${req.params.id}`)?.toJSON(),
          latest_am_app_version: this.amAppVersion.id,
        };
      });

      // AmAppVersion for a "SCANNED" amApp
      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: this.file.id,
        am_app: this.amApp.id,
      });

      const normalizedAmAppVersion = this.store.normalize(
        'am-app-version',
        amAppVersion.toJSON()
      );

      this.amAppVersion = this.store.push(normalizedAmAppVersion);

      await render(
        hbs`<AppMonitoring::DetailsTable::StoreVersion @amAppVersion={{this.amAppVersion}} />`
      );

      assert
        .dom('[data-test-am-details-table-store-version]')
        .exists()
        .containsText(this.amAppVersion.comparableVersion);

      assert
        .dom('[data-test-am-details-table-store-version-fileID]')
        .exists()
        .containsText('t:fileID:()')
        .containsText(this.amAppVersion.latestFile.get('id'));

      assert
        .dom('[data-test-am-details-table-store-version-status]')
        .exists()
        .containsText('t:scanned:()');
    });

    test('it renders correctly when amApp is "NOT SCANNED"', async function (assert) {
      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return {
          ...schema.amApps.find(`${req.params.id}`)?.toJSON(),
          latest_am_app_version: this.amAppVersion.id,
        };
      });

      // AmAppVersion for a "NOT SCANNED" amApp
      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: null,
        am_app: this.amApp.id,
      });

      const normalizedAmAppVersion = this.store.normalize(
        'am-app-version',
        amAppVersion.toJSON()
      );

      this.amAppVersion = this.store.push(normalizedAmAppVersion);

      await render(
        hbs`<AppMonitoring::DetailsTable::StoreVersion @amAppVersion={{this.amAppVersion}} />`
      );

      assert
        .dom('[data-test-am-details-table-store-version]')
        .exists()
        .containsText(this.amAppVersion.get('comparableVersion'));

      assert
        .dom('[data-test-am-details-table-store-version-status]')
        .exists()
        .containsText('t:notScanned:()');

      assert
        .dom('[data-test-am-details-table-store-version-fileID]')
        .doesNotExist();
    });
  }
);
