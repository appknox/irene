import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
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

  setQueryParams(params) {
    if (params.limit !== undefined) {
      this.limit = params.limit;
    }
    if (params.offset !== undefined) {
      this.offset = params.offset;
    }
    return this;
  }

  fetch = {
    perform() {},
  };
}

module(
  'Integration | Component | storeknox/fake-apps/fake-app-list/list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const skFakeAppsListService = new SkFakeAppsListServiceStub();
      this.owner.register('service:sk-fake-apps-list', skFakeAppsListService, {
        instantiate: false,
      });

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

      this.skFakeAppsListService = skFakeAppsListService;
    });

    test('it renders empty state when no results and not fetching', async function (assert) {
      this.skFakeAppsListService.setProperties({
        skFakeApps: [],
        isFetching: false,
        totalCount: 0,
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
          @emptyTitle="No fake apps found"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-empty]')
        .exists('shows empty state');

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-empty]')
        .containsText('No fake apps found');
    });

    test('it renders loading state while fetching', async function (assert) {
      this.skFakeAppsListService.setProperties({
        skFakeApps: [],
        isFetching: true,
        totalCount: 0,
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-loading]')
        .exists('shows loading state');
    });

    test('it renders results with fake apps when data is loaded', async function (assert) {
      const store = this.owner.lookup('service:store');

      const fakeApp1 = this.server.create('sk-fake-app', {
        id: 1,
        title: 'Fake App 1',
      });

      const fakeApp2 = this.server.create('sk-fake-app', {
        id: 2,
        title: 'Fake App 2',
      });

      const fakeApp1Record = store.push(
        store.normalize('sk-fake-app', fakeApp1.toJSON())
      );

      const fakeApp2Record = store.push(
        store.normalize('sk-fake-app', fakeApp2.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeApp1Record, fakeApp2Record],
        isFetching: false,
        totalCount: 2,
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-results]')
        .exists('shows results container');

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-card="1"]')
        .exists('renders first fake app card');

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-card="2"]')
        .exists('renders second fake app card');
    });

    test('it handles ignored fake apps correctly', async function (assert) {
      const store = this.owner.lookup('service:store');

      const ignoredFakeApp = this.server.create('sk-fake-app', {
        id: 1,
        is_ignored: true,
        reviewed_by: 'admin@example.com',
      });

      const ignoredFakeAppRecord = store.push(
        store.normalize('sk-fake-app', ignoredFakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [ignoredFakeAppRecord],
        isFetching: false,
        totalCount: 1,
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="ignored"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-results]')
        .exists('shows results for ignored apps');

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-card="1"]')
        .exists('renders ignored fake app card');
    });
  }
);
