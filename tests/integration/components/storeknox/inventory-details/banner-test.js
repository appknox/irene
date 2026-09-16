import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | storeknox/inventory-details/banner',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
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
    });

    test('a decommissioned app does not get told to re-enable monitoring', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
        monitoring_enabled: false,
        decommissioned_on: new Date('2026-09-01'),
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Banner
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-bannerText]')
        .doesNotIncludeText(
          t('storeknox.monitoringDisabledBannerMessage').replace(
            /<[^>]+>/g,
            ''
          ),
          'must not instruct the user to turn monitoring back on'
        );
    });

    test('a monitoring-disabled app keeps its existing banner', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.ACTIVE,
        monitoring_enabled: false,
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Banner
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-bannerText]')
        .includesText(
          t('storeknox.monitoringDisabledBannerMessage').replace(
            /<[^>]+>/g,
            ''
          ),
          'the ordinary disabled banner must still render its own message'
        );
    });

    test('a decommissioned app with no removal timestamp does not fabricate a date', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.DECOMMISSIONED,
        monitoring_enabled: false,
        decommissioned_on: null,
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Banner
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      const bannerText = document
        .querySelector('[data-test-storeknoxInventoryDetails-bannerText]')
        .textContent.trim();

      assert.notOk(
        /Invalid Date/.test(bannerText),
        'must not render "Invalid Date"'
      );

      assert.notOk(
        bannerText.includes(dayjs().format('MMM DD, YYYY')),
        "must not fabricate today's date as the removal date"
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-bannerText]')
        .includesText(
          t('storeknox.decommissionedBannerMessageNoDate').replace(
            /<[^>]+>/g,
            ''
          ),
          'must fall back to the dateless decommissioned copy'
        );
    });

    test('an archived app keeps its existing archived banner', async function (assert) {
      this.skInventoryApp = this.buildApp({
        app_status: ENUMS.SK_APP_STATUS.ARCHIVED,
        monitoring_enabled: false,
        archived_on: dayjs().subtract(6, 'months').toISOString(),
      });

      await render(
        hbs`<Storeknox::InventoryDetails::Banner
              @skInventoryApp={{this.skInventoryApp}}
            />`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-bannerText]')
        .includesText(
          'This app has been archived',
          'the archived banner must still render its own message'
        );

      assert
        .dom('[data-test-storeknoxInventoryDetails-bannerText]')
        .doesNotIncludeText(
          t('storeknox.monitoringDisabledBannerMessage').replace(
            /<[^>]+>/g,
            ''
          ),
          'the archived banner must not be replaced by the monitoring-disabled message'
        );
    });
  }
);
