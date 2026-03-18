import { faker } from '@faker-js/faker';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, findAll, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import ENUMS from 'irene/enums';

class RouterStub extends Service {
  transitionTo() {}
}

class SkAppsServiceStub extends Service {
  @tracked skApps = [];
  @tracked skAppsCount = 0;
  @tracked isFetchingSkInventoryApps = false;
  @tracked limit = 10;
  @tracked offset = 0;
  @tracked searchQuery = '';
  fetchFakeAppsCallCount = 0;

  fetchFakeApps = {
    perform: () => {
      this.fetchFakeAppsCallCount++;
    },
  };
}

module('Integration | Component | storeknox/fake-apps', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);
    this.owner.register('service:sk-apps', SkAppsServiceStub);

    this.skAppsService = this.owner.lookup('service:sk-apps');

    const store = this.owner.lookup('service:store');

    const appMetadata1 = this.server.create('sk-app-metadata', {
      title: 'Test App 1',
      package_name: 'com.test.app1',
      icon_url: 'https://example.com/icon1.png',
      url: 'https://example.com/app1',
      dev_name: 'Developer One',
      platform: ENUMS.PLATFORM.ANDROID,
    });

    const appMetadata2 = this.server.create('sk-app-metadata', {
      title: 'Test App 2',
      package_name: 'com.test.app2',
      icon_url: 'https://example.com/icon2.png',
      url: 'https://example.com/app2',
      dev_name: 'Developer Two',
      platform: ENUMS.PLATFORM.IOS,
    });

    const skApp1 = this.server.create('sk-app', {
      id: '1',
      app_metadata: appMetadata1,
      fake_app_counts: { brand_abuse: 3, fake_app: 2, ignored: 1 },
      last_fake_detection_on: faker.date.recent().toISOString(),
    });

    const skApp2 = this.server.create('sk-app', {
      id: '2',
      app_metadata: appMetadata2,
      fake_app_counts: { brand_abuse: 1, fake_app: 4, ignored: 2 },
      last_fake_detection_on: faker.date.recent().toISOString(),
    });

    this.skApp1Record = store.push(
      store.normalize('sk-app', {
        ...skApp1.toJSON(),
        app_metadata: appMetadata1.toJSON(),
      })
    );

    this.skApp2Record = store.push(
      store.normalize('sk-app', {
        ...skApp2.toJSON(),
        app_metadata: appMetadata2.toJSON(),
      })
    );
  });

  test('it renders the page header and description', async function (assert) {
    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-storeknoxFakeApps-headerText]')
      .exists()
      .hasText(t('storeknox.fakeAppsTitle'));

    assert
      .dom('[data-test-storeknoxFakeApps-descriptionText]')
      .exists()
      .hasText(t('storeknox.fakeApps.listingPageDescription'));
  });

  test('it renders the search input with placeholder and powered by AI chip', async function (assert) {
    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-storeknoxFakeApps-searchInput]')
      .exists()
      .hasAttribute('placeholder', t('searchQuery'));

    assert.dom('[data-test-storeknoxFakeApps-poweredByAiChip]').exists();
  });

  test('it renders app cards when data is loaded', async function (assert) {
    this.skAppsService.skApps = [this.skApp1Record, this.skApp2Record];
    this.skAppsService.skAppsCount = 2;

    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-storeknoxFakeAppsListItemCard-appTitle]')
      .exists({ count: 2 }, 'renders a card for each app');

    assert
      .dom('[data-test-storeknoxFakeAppsListItemCard-appTitle]')
      .hasText('Test App 1');
  });

  test('it renders the android store logo for android apps', async function (assert) {
    this.skAppsService.skApps = [this.skApp1Record];
    this.skAppsService.skAppsCount = 1;

    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-storeknoxFakeAppsListItemCard-playStoreLogo]')
      .exists('shows play store logo for android app');

    assert
      .dom('[data-test-storeknoxFakeAppsListItemCard-appStoreLogo]')
      .doesNotExist();
  });

  test('it renders the iOS store logo for iOS apps', async function (assert) {
    this.skAppsService.skApps = [this.skApp2Record];
    this.skAppsService.skAppsCount = 1;

    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-storeknoxFakeAppsListItemCard-appStoreLogo]')
      .exists('shows app store logo for iOS app');

    assert
      .dom('[data-test-storeknoxFakeAppsListItemCard-playStoreLogo]')
      .doesNotExist();
  });

  test('it shows the empty state when there are no apps', async function (assert) {
    this.skAppsService.skApps = [];
    this.skAppsService.skAppsCount = 0;
    this.skAppsService.isFetchingSkInventoryApps = false;

    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-storeknoxInventory-appListTable-tableEmpty]')
      .exists();

    assert
      .dom(
        '[data-test-storeknoxInventory-appListTable-tableEmptyHeaderDescription]'
      )
      .hasText(t('storeknox.noAppMatchesYourCurrentFilter'));
  });

  test('it hides pagination when in loading state', async function (assert) {
    this.skAppsService.isFetchingSkInventoryApps = true;
    this.skAppsService.skAppsCount = 20;

    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-pagination-btns-container]')
      .doesNotExist('pagination is hidden while loading');
  });

  test('it hides pagination when there are no apps', async function (assert) {
    this.skAppsService.skApps = [];
    this.skAppsService.skAppsCount = 0;

    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-pagination-btns-container]')
      .doesNotExist('pagination is hidden on empty state');
  });

  test('it shows pagination when apps are loaded', async function (assert) {
    this.skAppsService.skApps = [this.skApp1Record, this.skApp2Record];
    this.skAppsService.skAppsCount = 2;

    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-pagination-btns-container]')
      .exists('pagination is visible when apps are present');
  });

  test('it shows the clear button when search has a value', async function (assert) {
    await render(hbs`<Storeknox::FakeApps />`);

    assert
      .dom('[data-test-storeknoxFakeApps-clearSearchBtn]')
      .doesNotExist('clear button is hidden when query is empty');

    await fillIn('[data-test-storeknoxFakeApps-searchInput]', 'com.test');

    assert
      .dom('[data-test-storeknoxFakeApps-clearSearchBtn]')
      .exists('clear button appears after typing');
  });

  test('it clears the search query when the clear button is clicked', async function (assert) {
    await render(hbs`<Storeknox::FakeApps />`);

    await fillIn('[data-test-storeknoxFakeApps-searchInput]', 'com.test');

    assert.dom('[data-test-storeknoxFakeApps-clearSearchBtn]').exists();

    await click('[data-test-storeknoxFakeApps-clearSearchBtn]');

    assert.dom('[data-test-storeknoxFakeApps-clearSearchBtn]').doesNotExist();

    assert.dom('[data-test-storeknoxFakeApps-searchInput]').hasValue('');
  });

  test('it debounces search and updates service searchQuery', async function (assert) {
    await render(hbs`<Storeknox::FakeApps />`);

    assert.strictEqual(
      this.skAppsService.searchQuery,
      '',
      'searchQuery starts empty'
    );

    await fillIn('[data-test-storeknoxFakeApps-searchInput]', 'whatsapp');

    await waitUntil(() => this.skAppsService.searchQuery === 'whatsapp', {
      timeout: 1000,
    });

    assert.strictEqual(
      this.skAppsService.searchQuery,
      'whatsapp',
      'service searchQuery updated after debounce'
    );

    assert.ok(
      this.skAppsService.fetchFakeAppsCallCount > 0,
      'fetchFakeApps was triggered after search'
    );
  });

  test('it clears service searchQuery and triggers fetch when clear button is clicked', async function (assert) {
    await render(hbs`<Storeknox::FakeApps />`);

    await fillIn('[data-test-storeknoxFakeApps-searchInput]', 'whatsapp');

    await waitUntil(() => this.skAppsService.searchQuery === 'whatsapp', {
      timeout: 1000,
    });

    const callCountBeforeClear = this.skAppsService.fetchFakeAppsCallCount;

    await click('[data-test-storeknoxFakeApps-clearSearchBtn]');

    assert.strictEqual(
      this.skAppsService.searchQuery,
      '',
      'service searchQuery cleared'
    );

    assert.dom('[data-test-storeknoxFakeApps-searchInput]').hasValue('');

    assert.ok(
      this.skAppsService.fetchFakeAppsCallCount > callCountBeforeClear,
      'fetchFakeApps triggered after clearing search'
    );
  });

  test('it opens the powered by AI drawer with correct content and closes it', async function (assert) {
    await render(hbs`<Storeknox::FakeApps />`);

    assert.dom('[data-test-poweredByAi-drawer]').doesNotExist();

    await click('[data-test-storeknoxFakeApps-poweredByAiChip]');

    assert.dom('[data-test-poweredByAi-drawer]').exists();

    assert
      .dom('[data-test-poweredByAi-drawer-title]')
      .hasText(t('aiPoweredFeatures'));

    const sectionTitles = findAll(
      '[data-test-poweredByAi-drawer-section-title]'
    );

    assert.strictEqual(sectionTitles.length, 3, 'drawer has 3 info sections');

    assert.dom(sectionTitles[0]).hasText(t('storeknox.fakeApps.aiDataAccess'));
    assert.dom(sectionTitles[1]).hasText(t('storeknox.fakeApps.aiDataUsage'));

    assert
      .dom(sectionTitles[2])
      .hasText(t('storeknox.fakeApps.aiDataProtection'));

    const sectionBodies = findAll(
      '[data-test-poweredByAi-drawer-section-body]'
    );

    assert
      .dom(sectionBodies[0])
      .containsText(t('storeknox.fakeApps.aiDataAccessDescription'));
    assert
      .dom(sectionBodies[1])
      .containsText(t('storeknox.fakeApps.aiDataUsageDescription'));

    const listItems = findAll(
      '[data-test-poweredByAi-drawer-section-list-item]'
    );

    assert.strictEqual(
      listItems.length,
      3,
      'data protection section has 3 list items'
    );

    assert
      .dom(listItems[0])
      .containsText(t('storeknox.fakeApps.aiDataProtectionList.item1'));
    assert
      .dom(listItems[1])
      .containsText(t('storeknox.fakeApps.aiDataProtectionList.item2'));
    assert
      .dom(listItems[2])
      .containsText(t('storeknox.fakeApps.aiDataProtectionList.item3'));

    await click('[data-test-poweredByAi-drawer-close-btn]');

    assert.dom('[data-test-poweredByAi-drawer]').doesNotExist();
  });
});
