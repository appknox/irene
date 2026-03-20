import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render, findAll } from '@ember/test-helpers';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import ENUMS from 'irene/enums';

class RouterServiceStub extends Service {
  transitionedTo = null;

  transitionTo(...args) {
    this.transitionedTo = args;
  }
}

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
      this.owner.register('service:router', RouterServiceStub);

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
      this.store = store;
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

    test('it renders the correct column headers', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app');

      const fakeAppRecord = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeAppRecord],
        isFetching: false,
        totalCount: 1,
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-th-cell]')
        .exists({ count: 8 }, '8 columns for non-ignored tab');
    });

    test('it renders 7 columns for the ignored tab (no action column)', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        reviewed_by: 'admin@example.com',
      });

      const fakeAppRecord = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeAppRecord],
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
        .dom('[data-test-storeknoxFakeAppsFakeAppListList-th-cell]')
        .exists({ count: 7 }, '7 columns for ignored tab');
    });

    // --- Table data ---

    test('it renders a row for each fake app with correct cell data', async function (assert) {
      const fakeApp1 = this.server.create('sk-fake-app', {
        title: 'Shady App',
        package_name: 'com.shady.app',
        dev_name: 'Evil Corp',
        ai_scores: {
          final: 0.75,
          SemanticSimilarityRule: 0.7,
          LogoSimilarityRule: 0.6,
        },
        ai_score_levels: {
          SemanticSimilarityRule: 'HIGH',
          LogoSimilarityRule: 'MEDIUM',
        },
        sk_store: { platform: ENUMS.PLATFORM.ANDROID },
      });

      const fakeApp2 = this.server.create('sk-fake-app', {
        title: 'Copycat App',
        package_name: 'com.copycat.app',
        dev_name: 'Pirate Dev',
        ai_scores: { final: 0.5 },
        sk_store: { platform: ENUMS.PLATFORM.IOS },
      });

      const fakeApp1Record = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp1.toJSON())
      );

      const fakeApp2Record = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp2.toJSON())
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

      const rows = findAll('[data-test-storeknoxFakeAppsFakeAppListList-row]');

      assert.strictEqual(rows.length, 2, 'renders one row per fake app');

      // Row 1: Android app
      const [row1, row2] = rows;

      assert
        .dom('[data-test-storeknoxFakeAppListTable-appName]', row1)
        .containsText('Shady App');

      assert
        .dom('[data-test-storeknoxFakeAppListTable-namespace]', row1)
        .containsText('com.shady.app');

      assert
        .dom('[data-test-storeknoxFakeAppListTable-developer]', row1)
        .containsText('Evil Corp');

      assert
        .dom('[data-test-storeknoxFakeAppListTable-confidence]', row1)
        .containsText('75%');

      assert
        .dom('[data-test-storeknoxFakeAppListTable-playstoreLogo]', row1)
        .exists('Play Store logo for Android');

      // Row 2: iOS app
      assert
        .dom('[data-test-storeknoxFakeAppListTable-appName]', row2)
        .containsText('Copycat App');

      assert
        .dom('[data-test-storeknoxFakeAppListTable-confidence]', row2)
        .containsText('50%');

      assert
        .dom('[data-test-storeknoxFakeAppListTable-appstoreLogo]', row2)
        .exists('App Store logo for iOS');
    });

    // --- Info text ---

    test('it renders the info text when provided', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app');

      const fakeAppRecord = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeAppRecord],
        isFetching: false,
        totalCount: 1,
      });

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
        .dom('[class*="info-text"]')
        .containsText('These are suspected fake apps');
    });

    // --- Action column ---

    test('it shows the action button for pending (non-ignored) fake apps', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app');

      const fakeAppRecord = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeAppRecord],
        isFetching: false,
        totalCount: 1,
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppListTable-actionBtn]')
        .exists('action button visible for pending tab');
    });

    test('it hides the action column for the ignored tab', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        reviewed_by: 'admin@example.com',
      });

      const fakeAppRecord = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeAppRecord],
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
        .dom('[data-test-storeknoxFakeAppListTable-actionBtn]')
        .doesNotExist('action button hidden for ignored tab');
    });

    // --- Confidence edge cases ---

    test('it renders 0% confidence when aiScores.final is absent', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        ai_scores: {},
      });

      const fakeAppRecord = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeAppRecord],
        isFetching: false,
        totalCount: 1,
      });

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
      const fakeApp = this.server.create('sk-fake-app');

      const fakeAppRecord = this.store.push(
        this.store.normalize('sk-fake-app', fakeApp.toJSON())
      );

      this.skFakeAppsListService.setProperties({
        skFakeApps: [fakeAppRecord],
        isFetching: false,
        totalCount: 1,
      });

      await render(hbs`
        <Storeknox::FakeApps::FakeAppList::List
          @skInventoryApp={{this.skInventoryAppRecord}}
          @appsQueryStatus="pending"
        />
      `);

      const headers = findAll(
        '[data-test-storeknoxFakeAppsFakeAppListList-th-cell]'
      );
      const headerTexts = [...headers].map((h) => h.textContent.trim());

      assert.true(
        headerTexts.includes(t('platform')),
        'Platform column header'
      );

      assert.true(
        headerTexts.includes(t('storeknox.store')),
        'Store column header'
      );

      assert.true(headerTexts.includes(t('appName')), 'App Name column header');

      assert.true(
        headerTexts.includes(t('namespace')),
        'Namespace column header'
      );

      assert.true(
        headerTexts.includes(t('developer')),
        'Developer column header'
      );

      assert.true(
        headerTexts.includes(t('storeknox.fakeApps.confidence')),
        'Confidence column header'
      );

      assert.true(headerTexts.includes(t('action')), 'Action column header');
    });
  }
);
