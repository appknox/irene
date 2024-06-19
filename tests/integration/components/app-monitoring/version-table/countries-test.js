import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';

import {
  find,
  findAll,
  render,
  triggerEvent,
  waitFor,
} from '@ember/test-helpers';

module(
  'Integration | Component | app-monitoring/version-table/countries',

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

      // AmAppStoreInstances
      const amAppStoreInstances = [1, 2, 3].map((id) => {
        const amAppStoreInstance = this.server.create(
          'am-app-store-instance',
          id
        );

        // Creates associated records
        this.server.create('am-app-record', {
          id,
          latest_file: file.id,
          am_app_version: amAppVersion.id,
          am_app_store_instance: amAppStoreInstance.id,
        });

        const normalized = this.store.normalize(
          'am-app-store-instance',
          amAppStoreInstance.toJSON()
        );

        return this.store.push(normalized);
      });

      this.setProperties({
        amApp,
        file,
        project,
        amAppVersion,
        amAppStoreInstances,
      });

      // Server mocks
      this.server.get('/v2/am_app_versions/:id', (schema, req) => {
        return schema.amAppVersions.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_apps/:id', (schema, req) => {
        return schema.amApps.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('v2/am_app_store_instances/:id', (schema, req) => {
        return schema.amAppStoreInstances.find(`${req.params.id}`)?.toJSON();
      });
    });

    test('it renders loading state and the correct country codes with their respective names in a tooltip', async function (assert) {
      this.server.get(
        'v2/am_app_versions/:id/am_app_records',
        (schema, req) => {
          const results = schema.db.amAppRecords.where({
            am_app_version: req.params.id,
          });

          return { count: results.length, previous: null, next: null, results };
        },
        { timing: 150 }
      );

      render(
        hbs`<AppMonitoring::VersionTable::Countries @amAppVersion={{this.amAppVersion}} />`
      );

      await waitFor('[data-test-details-table-countriesCodesLoader]', {
        timeout: 150,
      });

      assert.dom('[data-test-details-table-countriesCodesLoader]').exists();

      await waitFor('[data-test-details-table-countriesCodes]', {
        timeout: 150,
      });

      assert.dom('[data-test-details-table-countriesCodes]').exists();

      const countryCodes = this.amAppStoreInstances.map((record) =>
        record.get('countryCode')
      );

      const allRenderedCountryCodes = findAll(
        '[data-test-amVersionTable-countryCode]'
      );

      assert.strictEqual(allRenderedCountryCodes.length, countryCodes.length);

      for (let idx = 0; idx < countryCodes.length; idx++) {
        const cc = countryCodes[idx];

        const countryCodeElement = find(
          `[data-test-amVersionTable-countryCodeId='${cc}']`
        );

        assert.dom(countryCodeElement).exists().containsText(cc);

        const countryCodeTooltip = find(
          `[data-test-amVersionTable-countryCodeTooltipId='${cc}']`
        );

        await triggerEvent(countryCodeTooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .exists()
          .containsText(COUNTRY_NAMES_MAP[cc]);

        await triggerEvent(countryCodeTooltip, 'mouseleave');
      }
    });

    test('it renders "-" if no country code exists in store instance', async function (assert) {
      this.server.get(
        'v2/am_app_versions/:id/am_app_records',
        (schema, req) => {
          const results = schema.db.amAppRecords.where({
            am_app_version: req.params.id,
          });

          return { count: results.length, previous: null, next: null, results };
        }
      );

      // AmAppVersion Record
      this.amAppVersion = this.server.create('am-app-version', {
        id: 999,
        latest_file: this.file.id,
        am_app: this.amApp.id,
      });

      const amAppStoreInstance = this.server.create('am-app-store-instance', {
        country_code: '',
      });

      // Creates associated records
      this.server.create('am-app-record', {
        latest_file: this.file.id,
        am_app_version: this.amAppVersion.id,
        am_app_store_instance: amAppStoreInstance.id,
      });

      await render(
        hbs`<AppMonitoring::VersionTable::Countries @amAppVersion={{this.amAppVersion}} />`
      );

      assert
        .dom('[data-test-details-table-countriesCodes]')
        .exists()
        .hasText('-');
    });
  }
);
