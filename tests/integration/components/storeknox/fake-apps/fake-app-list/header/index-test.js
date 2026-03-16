import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, render, waitFor } from '@ember/test-helpers';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | storeknox/fake-apps/fake-app-list/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const appMetadata = this.server.create('sk-app-metadata', {
        title: 'Test App',
        package_name: 'com.test.app',
        icon_url: 'https://example.com/icon.png',
        url: 'https://example.com/app',
        dev_name: 'Test Developer',
        platform: ENUMS.PLATFORM.ANDROID,
      });

      const skInventoryApp = this.server.create('sk-inventory-app', {
        app_metadata: appMetadata,
      });

      this.skInventoryAppRecord = store.push(
        store.normalize('sk-inventory-app', {
          ...skInventoryApp.toJSON(),
          app_metadata: appMetadata.toJSON(),
        })
      );
    });

    test('it renders the header with detection date and icon in correct format', async function (assert) {
      const testDate = new Date('2024-03-13T10:30:00Z');
      this.skInventoryAppRecord.set(
        'lastFakeDetectionOn',
        testDate.toISOString()
      );

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::Header
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      const expectedDate = dayjs(testDate).format('MMM DD, YYYY');

      assert
        .dom(
          '[data-test-storeknoxFakeAppsFakeAppListHeader-lastFakeDetectionDateTooltip]'
        )
        .exists('shows last fake detection date tooltip');

      assert
        .dom(
          '[data-test-storeknoxFakeAppsFakeAppListHeader-lastFakeDetectionDate]'
        )
        .hasText(expectedDate, 'shows date in MMM DD, YYYY format');

      assert
        .dom(
          '[data-test-storeknoxFakeAppsFakeAppListHeader-lastFakeDetectionDateIcon]'
        )
        .exists('shows event icon for detection date');
    });

    test('menu button opens, renders menu items with correct navigation', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::Header
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      // Open the menu
      await click('[data-test-storeknoxFakeAppsFakeAppListHeader-menuBtn]');

      await waitFor('[data-test-storeknoxFakeAppsFakeAppListHeader-menuItem]', {
        timeout: 500,
      });

      // Verify menu item is visible
      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListHeader-menuItem]')
        .exists('menu item is visible after clicking button');

      // Verify menu item has correct route link
      assert
        .dom(
          '[data-test-storeknoxFakeAppsFakeAppListHeader-menuItem] a[href*="/inventory-details/"]'
        )
        .exists('menu contains navigation link to inventory details');
    });
  }
);
