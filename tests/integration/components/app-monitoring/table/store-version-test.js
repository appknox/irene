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
      });

      this.setProperties({
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

      this.server.get('/v2/am_app_syncs/:id', (schema, req) => {
        return schema.amAppSyncs.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return schema.amApps.find(`${req.params.id}`)?.toJSON();
      });
    });

    test('it renders "NOT FOUND" status in store version column if comparableVersion is empty and relevantAmAppVersion is null', async function (assert) {
      this.server.get('/v2/am_apps/:id/latest_versions', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      // For a "NOT FOUND" state the relevantAmAppVersion is null.
      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        last_sync: this.amAppSync.id,
        relevant_am_app_version: null,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalizedAmApp);

      await render(
        hbs`<AppMonitoring::Table::StoreVersion @amApp={{this.amApp}}  />`
      );

      assert
        .dom('[data-test-amTableRow-store-version]')
        .containsText('t:notFound:()');
    });

    test('it renders "PENDING" status in store version column if comparableVersion is empty and lastSync are null', async function (assert) {
      this.server.get('/v2/am_apps/:id/latest_versions', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      // For a "PENDING" state the relevantAmAppVersion and lastSync are null.
      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        last_sync: null,
        relevant_am_app_version: null,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalizedAmApp);

      await render(
        hbs`
        <AppMonitoring::Table::StoreVersion
          @amApp={{this.amApp}}
        />`
      );

      assert
        .dom(
          '[data-test-amTableRow-store-version] [data-test-am-status-element]'
        )
        .containsText('t:pending:()');
    });

    test('it renders "NOT SCANNED" status when relevantAmAppVersion has a comparableVersion but latestFile is null', async function (assert) {
      this.server.get('/v2/am_apps/:id/latest_versions', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      // For a "NOT SCANNED" state the relevantAmAppVersion and lastSync exist
      // but the lastFile of the relevantAmAppVersion is null.
      const relevantAmAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: null,
      });

      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        last_sync: this.amAppSync.id,
        relevant_am_app_version: relevantAmAppVersion.id,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalizedAmApp);

      await render(
        hbs`
        <AppMonitoring::Table::StoreVersion
          @amApp={{this.amApp}}
        />`
      );

      assert
        .dom('[data-test-amTableRow-store-version]')
        .containsText(
          `${this.amApp.get('relevantAmAppVersion').get('comparableVersion')}`
        )
        .containsText(`t:notScanned:()`);

      assert
        .dom(
          '[data-test-amTableRow-store-version] [data-test-am-status-element]'
        )
        .exists()
        .containsText(`t:notScanned:()`);
    });

    test('it renders "SCANNED" status when relevantAmAppVersion has a comparableVersion and a latestFile', async function (assert) {
      this.server.get('/v2/am_apps/:id/latest_versions', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      // For a "SCANNED" state the relevantAmAppVersion and lastSync exist
      // and the lastFile of the relevantAmAppVersion exists also.
      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: this.file.id,
      });

      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        last_sync: this.amAppSync.id,
        relevant_am_app_version: amAppVersion.id,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalizedAmApp);

      await render(
        hbs`
        <AppMonitoring::Table::StoreVersion
          @amApp={{this.amApp}}
        />`
      );

      assert
        .dom('[data-test-amTableRow-store-version]')
        .containsText(
          `${this.amApp.get('relevantAmAppVersion').get('comparableVersion')}`
        );

      assert
        .dom(
          '[data-test-amTableRow-store-version] [data-test-am-status-element]'
        )
        .doesNotExist();
    });

    test('it renders multiple versions icon if amApp has multiple versions with distinct comparableVersions', async function (assert) {
      this.server.get('/v2/am_apps/:id/latest_versions', (schema) => {
        const results = schema.amAppVersions.all().models;

        return { count: 0, next: null, previous: null, results };
      });

      const files = [this.file, ...this.server.createList('file', 4)];

      const amAppVersions = files.map((file) =>
        this.server.create('am-app-version', {
          latest_file: file.id,
        })
      );

      const amApp = this.server.create('am-app', {
        id: 1,
        project: this.project.id,
        last_sync: this.amAppSync.id,
        relevant_am_app_version: amAppVersions[0].id,
      });

      const normalizedAmApp = this.store.normalize('am-app', amApp.toJSON());

      this.amApp = this.store.push(normalizedAmApp);

      await render(
        hbs`
        <AppMonitoring::Table::StoreVersion
          @amApp={{this.amApp}}
        />`
      );

      assert
        .dom('[data-test-amTable-storeVersion-multipleVersion-tooltip]')
        .exists();

      assert
        .dom('[data-test-amTable-storeVersion-multipleVersion-icon]')
        .exists();
    });
  }
);
