import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, fillIn, findAll, render } from '@ember/test-helpers';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import ENUMS from 'irene/enums';

class RouterServiceStub extends Service {
  transitionTo() {}
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

class SkFakeAppsListServiceStub extends Service {
  @tracked skFakeApps = [];
  @tracked isFetching = false;
  @tracked totalCount = 0;
  @tracked limit = 10;
  @tracked offset = 0;

  reloadCalled = false;

  reload() {
    this.reloadCalled = true;
  }

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
      this.owner.register('service:router', RouterServiceStub);
      this.owner.register('service:notifications', NotificationsStub);

      const skFakeAppsListService = new SkFakeAppsListServiceStub();

      this.owner.register('service:sk-fake-apps-list', skFakeAppsListService, {
        instantiate: false,
      });

      const store = this.owner.lookup('service:store');
      const appMetadata = this.server.create('sk-app-metadata');
      const skInventoryApp = this.server.create('sk-inventory-app', {
        app_metadata: appMetadata,
      });

      this.store = store;

      this.skInventoryAppRecord = store.push(
        store.normalize('sk-inventory-app', {
          ...skInventoryApp.toJSON(),
          app_metadata: appMetadata.toJSON(),
        })
      );

      this.skFakeAppsListService = skFakeAppsListService;

      this.createAndLoadFakeApp = (attrs = {}) => {
        const skFakeApp = this.server.create('sk-fake-app', {
          sk_app: this.skInventoryAppRecord.id,
          ...attrs,
        });

        const record = store.push(
          store.normalize('sk-fake-app', {
            ...skFakeApp.toJSON(),
            sk_app: this.skInventoryAppRecord.id,
          })
        );

        skFakeAppsListService.setProperties({
          skFakeApps: [record],
          isFetching: false,
          totalCount: 1,
        });

        return record;
      };

      // Server mocks
      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });
    });

    // --- Empty state ---

    test('it renders the empty state when there are no results', async function (assert) {
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
          @emptyDescription="Try again later"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-empty]')
        .exists()
        .containsText('No fake apps found')
        .containsText('Try again later');

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-results]')
        .doesNotExist();
    });

    // --- Loading state ---

    test('it renders skeleton rows while fetching and hides pagination', async function (assert) {
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
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-empty]')
        .doesNotExist('empty state is hidden during loading');

      const rows = findAll('[data-test-storeknoxFakeAppsFakeAppListList-row]');

      assert.strictEqual(rows.length, 5, 'renders 5 skeleton rows');

      // Real data cells should not be visible during loading
      assert
        .dom('[data-test-storeknoxFakeAppListTable-appName]')
        .doesNotExist('no app name rendered during loading');

      assert
        .dom('[data-test-storeknoxFakeAppListTable-confidence]')
        .doesNotExist('no confidence value rendered during loading');

      // Pagination hidden during loading
      assert.dom('[data-test-akPagination]').doesNotExist();
    });

    // --- Table columns ---

    test.each(
      'it renders the correct number of columns per tab',
      [
        { appsQueryStatus: 'pending', expectedCount: 8 },
        { appsQueryStatus: 'ignored', expectedCount: 7 },
      ],
      async function (assert, { appsQueryStatus, expectedCount }) {
        this.createAndLoadFakeApp();
        this.set('appsQueryStatus', appsQueryStatus);

        await render(hbs`
          <Storeknox::FakeApps::FakeAppList::List
            @skInventoryApp={{this.skInventoryAppRecord}}
            @appsQueryStatus={{this.appsQueryStatus}}
          />
        `);

        assert
          .dom('[data-test-storeknoxFakeAppsFakeAppListList-th-cell]')
          .exists({ count: expectedCount });
      }
    );

    // --- Table data ---

    test.each(
      'it renders a row for each fake app with correct cell data',
      [
        { identifier: 'playstore', platform: ENUMS.PLATFORM.ANDROID },
        { identifier: 'appstore', platform: ENUMS.PLATFORM.IOS },
        { identifier: 'apkmody', platform: ENUMS.PLATFORM.ANDROID },
        { identifier: 'aptoide', platform: ENUMS.PLATFORM.ANDROID },
      ],
      async function (assert, { identifier, platform }) {
        const fakeAppRecord = this.createAndLoadFakeApp({
          store: { identifier, platform, name: identifier },
        });

        await render(hbs`
          <Storeknox::FakeApps::FakeAppList::List
            @skInventoryApp={{this.skInventoryAppRecord}}
            @appsQueryStatus="pending"
          />
        `);

        const rows = findAll(
          '[data-test-storeknoxFakeAppsFakeAppListList-row]'
        );

        assert.strictEqual(rows.length, 1, 'renders one row per fake app');

        assert
          .dom('[data-test-storeknoxFakeAppListTable-appName]', rows[0])
          .containsText(fakeAppRecord.title);

        assert
          .dom('[data-test-storeknoxFakeAppListTable-namespace]', rows[0])
          .containsText(fakeAppRecord.packageName);

        assert
          .dom('[data-test-storeknoxFakeAppListTable-developer]', rows[0])
          .containsText(fakeAppRecord.devName);

        assert
          .dom('[data-test-storeknoxFakeAppListTable-confidence]', rows[0])
          .containsText(Math.round(fakeAppRecord.aiScores.final * 100));

        // Checks for the different store icons
        if (identifier === 'apkmody') {
          assert
            .dom('[data-test-storeknoxFakeAppListTable-apkModyIcon]', rows[0])
            .hasAttribute('src', '/images/apkmody-icon.png')
            .hasAttribute('alt', fakeAppRecord.skStore.name);
        } else {
          assert
            .dom(
              `[data-test-storeknoxFakeAppListTable-storeIcon='${identifier}']`,
              rows[0]
            )
            .exists();
        }
      }
    );

    // --- Info text ---

    test('it renders the info text when provided', async function (assert) {
      this.createAndLoadFakeApp();

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
          @infoText="These are suspected fake apps"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-results]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppList-infoText]')
        .containsText('These are suspected fake apps');
    });

    // --- Action column ---

    test.each(
      'it shows/hides the action button based on the query status',
      [
        { appsQueryStatus: 'pending', shouldExist: true },
        { appsQueryStatus: 'ignored', shouldExist: false },
      ],
      async function (assert, { appsQueryStatus, shouldExist }) {
        this.createAndLoadFakeApp();
        this.set('appsQueryStatus', appsQueryStatus);

        await render(hbs`
          <Storeknox::FakeApps::FakeAppList::List
            @skInventoryApp={{this.skInventoryAppRecord}}
            @appsQueryStatus={{this.appsQueryStatus}}
          />
        `);

        if (shouldExist) {
          assert
            .dom('[data-test-storeknoxFakeAppListTable-actionBtn]')
            .exists();
        } else {
          assert
            .dom('[data-test-storeknoxFakeAppListTable-actionBtn]')
            .doesNotExist();
        }
      }
    );

    // --- Confidence edge cases ---

    test('it renders 0% confidence when aiScores.final is absent', async function (assert) {
      this.createAndLoadFakeApp({ ai_scores: {} });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppListTable-confidence]')
        .containsText('0%');
    });

    // --- Column header translations ---

    test('it renders the correct column header labels', async function (assert) {
      this.createAndLoadFakeApp();

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      const expectedHeaders = [
        t('platform'),
        t('storeknox.store'),
        t('storeknox.fakeApps.logo'),
        t('appName'),
        t('namespace'),
        t('developer'),
        t('storeknox.fakeApps.confidence'),
        t('action'),
      ];

      const headers = findAll(
        '[data-test-storeknoxFakeAppsFakeAppListList-th-cell]'
      );

      assert.strictEqual(
        headers.length,
        expectedHeaders.length,
        'renders the correct number of column headers'
      );

      expectedHeaders.forEach((label, i) => {
        assert.dom(headers[i]).containsText(label);
      });
    });

    // --- Ignore drawer ---

    const FAKE_APP_PLAYSTORE_MOCK = {
      name: 'Google Play',
      identifier: 'playstore',
      platform: ENUMS.PLATFORM.ANDROID,
      platform_display: 'android',
    };

    const FAKE_APP_APPSTORE_MOCK = {
      name: 'App Store',
      identifier: 'appstore',
      platform: ENUMS.PLATFORM.IOS,
      platform_display: 'apple',
    };

    test.each(
      'it opens the ignore drawer with the correct flow from official store action menus',
      [
        {
          storeLabel: 'Play Store',
          store: FAKE_APP_PLAYSTORE_MOCK,
          menuIndex: 0,
          confirmBtnKey: 'storeknox.yesIgnore',
        },
        {
          storeLabel: 'Play Store',
          store: FAKE_APP_PLAYSTORE_MOCK,
          menuIndex: 1,
          confirmBtnKey: 'storeknox.yesIgnoreAndAddToInventory',
        },
        {
          storeLabel: 'App Store',
          store: FAKE_APP_APPSTORE_MOCK,
          menuIndex: 0,
          confirmBtnKey: 'storeknox.yesIgnore',
        },
        {
          storeLabel: 'App Store',
          store: FAKE_APP_APPSTORE_MOCK,
          menuIndex: 1,
          confirmBtnKey: 'storeknox.yesIgnoreAndAddToInventory',
        },
      ],
      async function (assert, { storeLabel, store, menuIndex, confirmBtnKey }) {
        const skFakeAppRecord = this.createAndLoadFakeApp({
          reviewed_by: null,
          reviewed_on: null,
          ignore_reason: null,
          status: ENUMS.SK_FAKE_APP_STATUS.PENDING,
          store,
        });

        await render(hbs`
          <Storeknox::FakeApps::FakeAppList::List
            @skInventoryApp={{this.skInventoryAppRecord}}
            @appsQueryStatus="pending"
          />
        `);

        await click(
          `[data-test-storeknoxFakeAppListTable-actionBtn='${skFakeAppRecord.id}']`
        );

        const menuItems = findAll('[data-test-ak-list-item-button]');

        assert.strictEqual(
          menuItems.length,
          2,
          `${storeLabel} shows 2 options`
        );

        await click(menuItems[menuIndex].firstElementChild);

        assert
          .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
          .hasText(t('confirmation'));

        assert
          .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
          .hasText(t(confirmBtnKey));
      }
    );

    test('it submits the ignore reason, closes the drawer, and reloads the list', async function (assert) {
      const skFakeAppRecord = this.createAndLoadFakeApp({
        reviewed_by: null,
        reviewed_on: null,
        ignore_reason: null,
        status: ENUMS.SK_FAKE_APP_STATUS.PENDING,
        store: FAKE_APP_PLAYSTORE_MOCK,
      });

      this.server.post(
        'v2/sk_app/:sk_app_id/sk_fake_app/:id/ignore',
        (schema, req) => {
          const fakeApp = schema.skFakeApps.find(req.params.id);

          return {
            ...fakeApp.toJSON(),
            status: ENUMS.SK_FAKE_APP_STATUS.IGNORED,
            reviewed_by: 'reviewer@example.com',
            reviewed_on: new Date().toISOString(),
            ignore_reason: JSON.parse(req.requestBody).ignore_reason,
          };
        }
      );

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      await click(
        `[data-test-storeknoxFakeAppListTable-actionBtn='${skFakeAppRecord.id}']`
      );

      const menuItems = findAll('[data-test-ak-list-item-button]');

      await click(menuItems[0].firstElementChild);

      await fillIn(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]',
        'Not a real threat'
      );

      await click('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]');

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
        .doesNotExist('drawer closes after successful ignore');

      assert.true(
        this.skFakeAppsListService.reloadCalled,
        'list reload was triggered'
      );
    });

    test.each(
      'it shows only Ignore action for third-party stores and opens the drawer with that flow',
      [
        { name: 'ApkMody', identifier: 'apkmody' },
        { name: 'Aptoide', identifier: 'aptoide' },
      ],
      async function (assert, { name, identifier }) {
        const skFakeAppRecord = this.createAndLoadFakeApp({
          reviewed_by: null,
          reviewed_on: null,
          ignore_reason: null,
          status: ENUMS.SK_FAKE_APP_STATUS.PENDING,
          store: {
            name,
            identifier,
            platform: ENUMS.PLATFORM.ANDROID,
            platform_display: 'android',
          },
        });

        await render(hbs`
          <Storeknox::FakeApps::FakeAppList::List
            @skInventoryApp={{this.skInventoryAppRecord}}
            @appsQueryStatus="pending"
          />
        `);

        await click(
          `[data-test-storeknoxFakeAppListTable-actionBtn='${skFakeAppRecord.id}']`
        );

        const menuItems = findAll('[data-test-ak-list-item-button]');

        assert.strictEqual(
          menuItems.length,
          1,
          `${name} only shows Ignore (no add-to-inventory)`
        );

        await click(menuItems[0].firstElementChild);

        assert
          .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
          .hasText(t('confirmation'));

        assert
          .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
          .hasText(t('storeknox.yesIgnore'));
      }
    );
  }
);
