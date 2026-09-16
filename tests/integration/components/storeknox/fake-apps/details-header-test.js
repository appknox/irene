import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

class SkOrganizationStub extends Service {
  selected = {
    skFeatures: {
      fake_app_detection: true,
    },
  };
}

module(
  'Integration | Component | storeknox/fake-apps/details-header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.register('service:sk-organization', SkOrganizationStub);

      const store = this.owner.lookup('service:store');
      const appMetadata = this.server.create('sk-app-metadata');

      this.buildApp = (attrs = {}) => {
        const skApp = this.server.create('sk-inventory-app', {
          app_metadata: appMetadata,
          ...attrs,
        });

        return store.push(
          store.normalize('sk-inventory-app', {
            ...skApp.toJSON(),
            app_metadata: appMetadata.toJSON(),
          })
        );
      };

      const fakeApp = this.server.create('sk-fake-app', {
        reviewed_by: null,
      });

      this.fakeApp = store.push(
        store.normalize('sk-fake-app', fakeApp.toJSON())
      );
    });

    test('both write actions are disabled for a decommissioned app', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
        monitoring_enabled: false,
      });

      await render(
        hbs`<Storeknox::FakeApps::DetailsHeader
              @fakeApp={{this.fakeApp}}
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
        .isDisabled();

      assert
        .dom(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        )
        .isDisabled();
    });

    test('both write actions stay enabled for an archived app (existing behaviour unaffected)', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.ARCHIVED,
        monitoring_enabled: false,
        archived_on: new Date().toISOString(),
      });

      await render(
        hbs`<Storeknox::FakeApps::DetailsHeader
              @fakeApp={{this.fakeApp}}
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
        .isNotDisabled();

      assert
        .dom(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        )
        .isNotDisabled();
    });

    test('both write actions stay enabled for a healthy active app (existing behaviour unaffected)', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.ACTIVE,
        monitoring_enabled: true,
      });

      await render(
        hbs`<Storeknox::FakeApps::DetailsHeader
              @fakeApp={{this.fakeApp}}
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
        .isNotDisabled();

      assert
        .dom(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        )
        .isNotDisabled();
    });

    test('the disabled tooltip explains decommissioning for a decommissioned app', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
        monitoring_enabled: false,
      });

      await render(
        hbs`<Storeknox::FakeApps::DetailsHeader
              @fakeApp={{this.fakeApp}}
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      const ignoreBtn = document.querySelector(
        '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]'
      );

      assert.ok(
        ignoreBtn?.closest('[data-test-ak-tooltip-root]'),
        'ignore button is wrapped in a tooltip'
      );

      const addToInventoryBtn = document.querySelector(
        '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
      );

      assert.ok(
        addToInventoryBtn?.closest('[data-test-ak-tooltip-root]'),
        'add-to-inventory button is wrapped in a tooltip'
      );
    });
  }
);
