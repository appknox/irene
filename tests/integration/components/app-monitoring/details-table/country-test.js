import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';

module(
  'Integration | Component | app-monitoring/details-table/country',

  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.store = this.owner.lookup('service:store');

      // File Record
      const file = this.server.create('file', 1);

      // Project Record
      const project = this.server.create('project', {
        last_file_id: file.id,
      });

      // AmApp Record.
      const amApp = this.server.create('am-app', {
        id: 1,
        latest_file: file.id,
        project: project.id,
      });

      // AmAppVersion Record
      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: file.id,
        am_app: amApp.id,
      });

      this.setProperties({
        amApp,
        file,
        project,
        amAppVersion,
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

      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return schema.amApps.find(`${req.params.id}`)?.toJSON();
      });
    });

    test('it renders the correct country code', async function (assert) {
      this.server.get('v2/am_app_store_instances/:id', (schema, req) => {
        return schema.amAppStoreInstances.find(`${req.params.id}`)?.toJSON();
      });

      const amAppStoreInstance = this.server.create('am-app-store-instance', 1);

      const amAppRecord = this.server.create('am-app-record', {
        am_app_version: this.amAppVersion.id,
        am_app_store_instance: amAppStoreInstance.id,
      });

      const normalized = this.store.normalize(
        'am-app-record',
        amAppRecord.toJSON()
      );

      this.amAppRecord = this.store.push(normalized);

      await render(
        hbs`<AppMonitoring::DetailsTable::Country @amAppRecord={{this.amAppRecord}} />`
      );

      assert
        .dom('[data-test-details-table-country-code]')
        .exists()
        .containsText(`${COUNTRY_NAMES_MAP[amAppStoreInstance.country_code]}`);
    });

    test('it renders "-" if no country code exists in store instance', async function (assert) {
      this.server.get('v2/am_app_store_instances/:id', (schema, req) => {
        return schema.amAppStoreInstances.find(`${req.params.id}`)?.toJSON();
      });

      const amAppStoreInstance = this.server.create('am-app-store-instance', {
        id: 1,
        country_code: '',
      });

      const amAppRecord = this.server.create('am-app-record', {
        am_app_version: this.amAppVersion.id,
        am_app_store_instance: amAppStoreInstance.id,
      });

      const normalized = this.store.normalize(
        'am-app-record',
        amAppRecord.toJSON()
      );

      this.amAppRecord = this.store.push(normalized);

      await render(
        hbs`<AppMonitoring::DetailsTable::Country @amAppRecord={{this.amAppRecord}} />`
      );

      assert
        .dom('[data-test-details-table-country-code]')
        .exists()
        .hasText('-');
    });
  }
);
