import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

import ENUMS from 'irene/enums';

function createSkFakeAppPayload(overrides = {}) {
  return {
    id: 1,
    title: 'Fake Test App',
    package_name: 'com.fake.test.app',
    app_url: 'https://example.com/fake-app',
    dev_name: 'Fake Developer',
    original_app_icon_url: 'https://example.com/original-icon.png',
    fake_app_icon_url: 'https://example.com/fake-icon.png',
    ai_confidence: 0.85,
    ai_classification_justification: 'Test justification',
    ai_classification_label: 'brand_abuse',
    ai_scores: {
      SemanticSimilarityRule: 0.9,
      SemanticSimilarityRule_justification: 'Semantic match',
      LogoSimilarityRule: 0.8,
      LogoSimilarityRule_justification: 'Logo match',
      TitleBrandAbuseRule: 0.75,
      TitleBrandAbuseRule_justification: 'Title abuse',
      PackageSimilarityRule: 0.7,
      PackageSimilarityRule_justification: 'Package match',
      DeveloperConsistencyRule: 0.65,
      DeveloperConsistencyRule_justification: 'Developer match',
      AppFunctionalitySimilarityRule: 0.6,
      AppFunctionalitySimilarityRule_justification: 'Functionality match',
    },
    store: {
      id: 1,
      name: 'Google Play',
      identifier: 'com.android.vending',
      icon: 'https://example.com/store-icon.png',
      platform: ENUMS.PLATFORM.ANDROID,
      platform_display: 'android',
    },
    reviewed_by: null,
    ...overrides,
  };
}

module(
  'Integration | Component | storeknox/fake-apps/details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      // Create sk-inventory-app for OriginalAppInfo
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

      // Create sk-fake-app manually (no mirage factory exists)
      const skFakeAppPayload = createSkFakeAppPayload();

      this.skFakeAppRecord = store.push(
        store.normalize('sk-fake-app', skFakeAppPayload)
      );
    });

    test('it renders the DetailsHeader component', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-breadcrumb]')
        .exists();
    });

    test('it renders the findings cards for each AI score category', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      // Component renders 8 finding categories: Overall Score, Semantic Similarity,
      // Logo Similarity, Title Brand Abuse, Package Similarity, Developer Consistency,
      // App Functionality Similarity (local-class produces hashed names)
      assert.dom('[class*="findings-card-container"]').exists();

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsCard-poweredByAiChip]')
        .exists();
    });

    test('it renders the OriginalAppInfo component', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-appLogo]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-appTitle]')
        .hasText('Test App');
    });

    test('it applies is-ignored class when fake app is ignored', async function (assert) {
      this.skFakeAppRecord.set('reviewedBy', 'user-123');

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[class*="findings-card-container"][class*="is-ignored"]')
        .exists();
    });

    test('it does not apply is-ignored class when fake app is not ignored', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[class*="findings-card-container"][class*="is-ignored"]')
        .doesNotExist();
    });
  }
);
