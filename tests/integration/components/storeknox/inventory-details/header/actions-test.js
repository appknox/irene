import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

class MeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

class RouterStub extends Service {
  currentRoute = {
    name: 'authenticated.storeknox.inventory-details.index',
  };

  transitionTo() {}
}

module(
  'Integration | Component | storeknox/inventory-details/header/actions',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:me', MeStub);

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

      this.noop = () => {};
    });

    test('the monitoring toggle is hidden for a decommissioned app', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
        monitoring_enabled: false,
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Header::Actions
              @skInventoryApp={{this.skInventoryApp}}
              @toggleMonitoringIsRunning={{false}}
              @monitoringChecked={{false}}
              @onMonitoringActionToggle={{this.noop}}
              @openArchiveAppDrawer={{this.noop}}
            />`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-monitoringStatusToggle]')
        .doesNotExist();
    });

    test('the archive button is hidden for a decommissioned app', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
        monitoring_enabled: false,
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Header::Actions
              @skInventoryApp={{this.skInventoryApp}}
              @toggleMonitoringIsRunning={{false}}
              @monitoringChecked={{false}}
              @onMonitoringActionToggle={{this.noop}}
              @openArchiveAppDrawer={{this.noop}}
            />`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-archiveButton]')
        .doesNotExist('archiving would overwrite the decommissioned state');
    });

    test('an active app keeps both controls', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.ACTIVE,
        monitoring_enabled: true,
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Header::Actions
              @skInventoryApp={{this.skInventoryApp}}
              @toggleMonitoringIsRunning={{false}}
              @monitoringChecked={{true}}
              @onMonitoringActionToggle={{this.noop}}
              @openArchiveAppDrawer={{this.noop}}
            />`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-monitoringStatusToggle]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-archiveButton]')
        .exists('an active app still gets an archive affordance');
    });

    test('an archived app keeps its existing behaviour: no toggle, archive button still shown', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.ARCHIVED,
        monitoring_enabled: false,
        archived_on: dayjs().subtract(6, 'months').toISOString(),
        unarchive_available_on: dayjs().subtract(1, 'month').toISOString(),
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Header::Actions
              @skInventoryApp={{this.skInventoryApp}}
              @toggleMonitoringIsRunning={{false}}
              @monitoringChecked={{false}}
              @onMonitoringActionToggle={{this.noop}}
              @openArchiveAppDrawer={{this.noop}}
            />`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-monitoringStatusToggle]')
        .doesNotExist('archived apps have never shown the monitoring toggle');

      assert
        .dom('[data-test-storeknoxInventoryDetails-archiveButton]')
        .exists('archived apps keep their unarchive affordance');
    });
  }
);
