import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { findAll, render, waitFor } from '@ember/test-helpers';
import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';

module(
  'Integration | Component | app-monitoring/details-table',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.store = this.owner.lookup('service:store');

      const amAppStoreInstances = this.server.createList(
        'am-app-store-instance',
        5
      );

      const files = this.server.createList('file', 5);

      const project = files.map((file) =>
        this.server.create('project', { last_file_id: file.id })
      );

      const amAppSync = this.server.create('am-app-sync', 1);

      const amApp = this.server.create('am-app', {
        project: project.id,
        last_sync: amAppSync.id,
      });

      const latestAmAppVersions = files.map((file) =>
        this.server.create('am-app-version', {
          latest_file: file.id,
          am_app: amApp.id,
        })
      );

      const amAppRecords = latestAmAppVersions.map((file, idx) =>
        this.server.create('am-app-record', {
          am_app_version: latestAmAppVersions[idx].id,
          am_app_store_instance: idx + 1,
        })
      );

      const normalized = this.store.normalize('am-app', amApp.toJSON());

      this.setProperties({
        project,
        amApp: this.store.push(normalized),
        latestAmAppVersions,
        amAppRecords,
        amAppStoreInstances,
      });

      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
        return {
          ...schema.files.find(`${req.params.id}`)?.toJSON(),
          project: req.params.id,
        };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_versions/:id', (schema, req) => {
        return schema.amAppVersions.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return schema.amApps.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_syncs/:id', (schema, req) => {
        return schema.amAppSyncs.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_store_instances/:id', (schema, req) => {
        return schema.amAppStoreInstances.find(`${req.params.id}`)?.toJSON();
      });
    });

    test('it renders amApp details loading and empty state ', async function (assert) {
      this.server.get(
        '/v2/am_apps/:amAppId/am_app_records',
        () => {
          return { count: 0, next: null, previous: null, results: [] };
        },
        { timing: 500 }
      );

      render(hbs`<AppMonitoring::DetailsTable @amApp={{this.amApp}} />`);

      await waitFor('[data-test-amDetailsTable-container]', { timeout: 500 });

      assert
        .dom('[data-test-amDetailsTable-loading]')
        .exists()
        .hasText('t:loading:()...');

      await waitFor('[data-test-amDetailsTable-empty]', { timeout: 500 });

      assert
        .dom('[data-test-am-emptyBodyText]')
        .exists()
        .hasText('t:appMonitoringMessages.monitoringDetailsEmpty.body:()');
    });

    test('it renders pending state loader if amApp is "PENDING" and monitoring is "ACTIVE"', async function (assert) {
      this.server.get('/v2/am_apps/:amAppId/am_app_records', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      const amApp = this.server.create('am-app', {
        project: this.project.id,
        last_sync: null,
        is_active: true,
      });

      const normalized = this.store.normalize('am-app', amApp.toJSON());
      this.amApp = this.store.push(normalized);

      await render(hbs`<AppMonitoring::DetailsTable @amApp={{this.amApp}} />`);

      assert
        .dom('[data-test-amDetailsTable-pendingStateLoader]')
        .exists()
        .hasText('t:appMonitoringMessages.pendingStateLoadingText:()');
    });

    test('it renders details table when atleast one amAppRecord exists and the amApp is not "PENDING"', async function (assert) {
      this.server.get('/v2/am_apps/:amAppId/am_app_records', (schema) => {
        const results = schema.amAppRecords.all().models;

        return { count: 0, next: null, previous: null, results };
      });

      await render(hbs`<AppMonitoring::DetailsTable @amApp={{this.amApp}} />`);

      assert.dom('[data-test-amDetailsTable]').exists();

      const amAppRecordRowElements = findAll('[data-test-amDetailsTable-row]');

      assert.strictEqual(
        amAppRecordRowElements.length,
        this.amAppRecords.length,
        'renders the correct number of app versions'
      );

      // first row sanity check
      const firstRow = amAppRecordRowElements[0].querySelectorAll(
        '[data-test-amDetailsTable-cell]'
      );

      // Checks for version row cells
      assert.dom(firstRow[0]).exists();

      assert
        .dom(firstRow[1])
        .exists()
        .containsText(
          `${COUNTRY_NAMES_MAP[this.amAppStoreInstances[0].country_code]}`
        );
    });
  }
);
