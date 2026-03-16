import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import ENUMS from 'irene/enums';

class SkFakeAppsListServiceStub extends Service {
  @tracked skFakeApps = [];
  @tracked isFetching = false;
  @tracked totalCount = 0;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked fakeAppCounts = null;

  setQueryParams(params) {
    this.limit = params.limit ?? this.limit;
    this.offset = params.offset ?? this.offset;
    return this;
  }

  fetch = {
    perform() {},
  };
}

module(
  'Integration | Component | storeknox/fake-apps/fake-app-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.register(
        'service:sk-fake-apps-list',
        SkFakeAppsListServiceStub
      );

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

    test('it renders initializing state when detection is in progress', async function (assert) {
      // fakeAppDetectionIsInitializing is a computed property that checks if fakeAppDetectionStatus === INITIALIZING (1)
      this.skInventoryAppRecord.set('fakeAppDetectionStatus', 1);

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList-initializingState]')
        .exists('shows initializing state');

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList-initializingState]')
        .containsText(t('storeknox.fakeApps.detectionInProgress'));
    });

    test('it renders success state when all fake app counts are zero', async function (assert) {
      // allFakeAppsCountsAreZero is a computed property that checks if fakeAppCounts has all zeros
      // fakeAppDetectionStatus = 3 (HAS_RESULTS) or any non-INITIALIZING status
      this.skInventoryAppRecord.setProperties({
        fakeAppDetectionStatus: 3,
        fakeAppCounts: {
          brand_abuse: 0,
          fake_app: 0,
          ignored: 0,
        },
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList-successState]')
        .exists('shows success state');

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList-successState]')
        .containsText(t('storeknox.fakeApps.noSuspectedApps'));
    });

    test('it renders tabs with correct labels and counts', async function (assert) {
      // showTabs checks: !isInitializing && !allCountsZero
      // So we need status != INITIALIZING and counts > 0
      this.skInventoryAppRecord.setProperties({
        fakeAppDetectionStatus: 3,
        fakeAppCounts: {
          brand_abuse: 5,
          fake_app: 3,
          ignored: 2,
        },
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList-tab="brand-abuse"]')
        .exists('renders brand-abuse tab')
        .containsText(t('storeknox.brandAbuse'));

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList-tab="fake-app"]')
        .exists('renders fake-app tab')
        .containsText(t('storeknox.fakeApps.fakeApp'));

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList-tab="ignored"]')
        .exists('renders ignored tab')
        .containsText(t('storeknox.fakeApps.ignored'));
    });

    test('it applies archived class when inventory app is archived', async function (assert) {
      // isArchived is a computed property that checks: archivedOn && appStatus === ARCHIVED (2)
      this.skInventoryAppRecord.setProperties({
        archivedOn: new Date().toISOString(),
        appStatus: 2,
        fakeAppDetectionStatus: 3,
        fakeAppCounts: {
          brand_abuse: 1,
          fake_app: 1,
          ignored: 1,
        },
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppList]')
        .hasClass(/.*archived/, 'applies archived class');
    });
  }
);
