import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';

import ENUMS from 'irene/enums';

// The factory does not stub justification fields or all rule scores;
// supply a complete ai_scores object for tests that assert on score values.
const AI_SCORES = {
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
};

module(
  'Integration | Component | storeknox/fake-apps/details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      this.appMetadata = this.server.create('sk-app-metadata', {
        platform: ENUMS.PLATFORM.ANDROID,
      });

      const skInventoryApp = this.server.create('sk-inventory-app', {
        app_metadata: this.appMetadata,
      });

      this.skInventoryAppRecord = store.push(
        store.normalize('sk-inventory-app', {
          ...skInventoryApp.toJSON(),
          app_metadata: this.appMetadata.toJSON(),
        })
      );

      this.skFakeApp = this.server.create('sk-fake-app', {
        ai_confidence: 0.85,
        ai_classification_label: 'brand_abuse',
        ai_classification_justification: 'Test justification',
        ai_scores: AI_SCORES,
        reviewed_by: null,
      });

      this.skFakeAppRecord = store.push(
        store.normalize('sk-fake-app', this.skFakeApp.toJSON())
      );

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);
    });

    // --- DetailsHeader ---

    test('it renders the fake app info in the DetailsHeader', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-breadcrumb]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-appLogo]')
        .exists()
        .hasAttribute('src', this.skFakeApp.fake_app_icon_url)
        .hasAttribute('alt', this.skFakeApp.title);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-appTitle]')
        .hasText(this.skFakeApp.title);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-packageName]')
        .hasText(this.skFakeApp.package_name);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-developerName]')
        .hasText(this.skFakeApp.dev_name);
    });

    test('it renders the Brand Abuse header title for brand_abuse classification', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-headerTitle]')
        .hasText(t('storeknox.brandAbuse'));
    });

    test('it renders the Fake App header title for fake_app classification', async function (assert) {
      const store = this.owner.lookup('service:store');

      const fakeAppRecord = store.push(
        store.normalize(
          'sk-fake-app',
          this.server
            .create('sk-fake-app', {
              ai_classification_label: 'fake_app',
              ai_scores: AI_SCORES,
            })
            .toJSON()
        )
      );

      this.set('fakeAppRecord', fakeAppRecord);

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.fakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-headerTitle]')
        .hasText(t('storeknox.fakeApps.fakeApp'));
    });

    test('it renders the Play Store logo and platform icon for Android fake apps', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-platformIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-playStoreLogo]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-appStoreLogo]')
        .doesNotExist();
    });

    test('it renders the App Store logo and platform icon for iOS fake apps', async function (assert) {
      const store = this.owner.lookup('service:store');

      const iosFakeAppRecord = store.push(
        store.normalize(
          'sk-fake-app',
          this.server
            .create('sk-fake-app', {
              ai_scores: AI_SCORES,
              store: {
                id: 2,
                name: 'App Store',
                identifier: 'com.apple.AppStore',
                icon: 'https://example.com/appstore-icon.png',
                platform: ENUMS.PLATFORM.IOS,
                platform_display: 'apple',
              },
            })
            .toJSON()
        )
      );

      this.set('iosFakeAppRecord', iosFakeAppRecord);

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.iosFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-platformIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-appStoreLogo]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-playStoreLogo]')
        .doesNotExist();
    });

    test('it renders the Ignore App and Ignore & Add to Inventory buttons when the fake app is not ignored', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
        .exists()
        .hasText(t('storeknox.ignoreApp'));

      assert
        .dom(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        )
        .exists()
        .hasText(t('storeknox.ignoreAddToInventory'));
    });

    test('it does not render the action buttons when the fake app is ignored', async function (assert) {
      this.skFakeAppRecord.set('reviewedBy', 'user-123');

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        )
        .doesNotExist();
    });

    test('it opens the ignore drawer when the Ignore App button is clicked', async function (assert) {
      await click('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]');

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]').exists();
    });

    test('it opens the ignore drawer when the Ignore & Add to Inventory button is clicked', async function (assert) {
      await click(
        '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
      );

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]').exists();
    });

    // --- FindingsCard ---

    test('it renders 7 findings cards with the Overall Score card having the PoweredByAi chip', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsFindingsCard-root]')
        .exists({ count: 7 });

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsCard-poweredByAiChip]')
        .exists();
    });

    test('it renders the correct score percentages and descriptions for all findings cards', async function (assert) {
      const findingsCards = document.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsCard-root]'
      );

      // Cards order: Overall(85%), Semantic(90%), Logo(80%), TitleBrandAbuse(75%),
      // Package(70%), DeveloperConsistency(65%), AppFunctionality(60%)
      const expectedCards = [
        { score: '85%', description: 'Test justification' },
        {
          score: '90%',
          description: AI_SCORES.SemanticSimilarityRule_justification,
        },
        {
          score: '80%',
          description: AI_SCORES.LogoSimilarityRule_justification,
        },
        {
          score: '75%',
          description: AI_SCORES.TitleBrandAbuseRule_justification,
        },
        {
          score: '70%',
          description: AI_SCORES.PackageSimilarityRule_justification,
        },
        {
          score: '65%',
          description: AI_SCORES.DeveloperConsistencyRule_justification,
        },
        {
          score: '60%',
          description: AI_SCORES.AppFunctionalitySimilarityRule_justification,
        },
      ];

      findingsCards.forEach((card, i) => {
        assert
          .dom('[data-test-storeknoxFakeAppsFindingsCard-score]', card)
          .hasText(expectedCards[i].score, `Card ${i + 1} score`);

        assert
          .dom('[data-test-storeknoxFakeAppsFindingsCard-description]', card)
          .hasText(expectedCards[i].description, `Card ${i + 1} description`);
      });
    });

    test('it renders the findings container without the ignored state when the fake app is not ignored', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsDetails-findingsContainer]')
        .exists()
        .doesNotHaveClass(/is-ignored/);
    });

    test('it renders the findings container with the ignored state when the fake app is ignored', async function (assert) {
      this.skFakeAppRecord.set('reviewedBy', 'user-123');

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetails-findingsContainer]')
        .exists()
        .hasClass(/is-ignored/);
    });

    // --- OriginalAppInfo ---

    test('it renders the original app info', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-appLogo]')
        .exists()
        .hasAttribute('src', this.appMetadata.icon_url)
        .hasAttribute('alt', this.appMetadata.title);

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-appTitle]')
        .hasText(this.appMetadata.title);

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-packageName]')
        .hasText(this.appMetadata.package_name);

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-developerName]')
        .containsText(this.appMetadata.dev_name);
    });

    test('it renders the Play Store logo and platform icon in OriginalAppInfo for Android apps', async function (assert) {
      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-platformIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-playStoreLogo]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-appStoreLogo]')
        .doesNotExist();
    });
  }
);
