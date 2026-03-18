import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, fillIn, find, render } from '@ember/test-helpers';

import ENUMS from 'irene/enums';

function calculateScorePercentage(score) {
  return score ? `${(score * 100).toFixed(0)}%` : '0%';
}

function capitalizeLevel(level) {
  if (!level) {
    return '-';
  }

  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
}

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

      this.skInventoryApp = this.server.create('sk-inventory-app', {
        app_metadata: this.appMetadata,
      });

      this.skInventoryAppRecord = store.push(
        store.normalize('sk-inventory-app', {
          ...this.skInventoryApp.toJSON(),
          app_metadata: this.appMetadata.toJSON(),
        })
      );

      this.skFakeApp = this.server.create('sk-fake-app', {
        sk_app: this.skInventoryApp.id,
        ai_classification_label: 'brand_abuse',
        reviewed_by: null,
      });

      this.skFakeAppRecord = store.push(
        store.normalize('sk-fake-app', this.skFakeApp.toJSON())
      );

      this.setProperties({ store });
    });

    // --- DetailsHeader: fake app info ---

    test.each(
      'it renders fake app info',
      ['fake_app', 'brand_abuse'],
      async function (assert, classification) {
        const fakeApp = this.server.create('sk-fake-app', {
          ai_classification_label: classification,
          reviewed_by: null,
        });

        this.set(
          'skFakeAppRecord',
          this.store.push(this.store.normalize('sk-fake-app', fakeApp.toJSON()))
        );

        await render(hbs`
          <Storeknox::FakeApps::Details
            @fakeApp={{this.skFakeAppRecord}}
            @skInventoryApp={{this.skInventoryAppRecord}}
          />
        `);

        assert
          .dom('[data-test-storeknoxFakeAppsDetailsHeader-appLogo]')
          .hasAttribute('src', this.skFakeAppRecord.fakeAppIconUrl);

        assert
          .dom('[data-test-storeknoxFakeAppsDetailsHeader-appTitle]')
          .hasText(this.skFakeAppRecord.title);

        assert
          .dom('[data-test-storeknoxFakeAppsDetailsHeader-packageName]')
          .hasText(this.skFakeAppRecord.packageName);

        assert
          .dom('[data-test-storeknoxFakeAppsDetailsHeader-developerName]')
          .hasText(this.skFakeAppRecord.devName);

        assert
          .dom('[data-test-storeknoxFakeAppsDetailsHeader-headerTitle]')
          .exists()
          .hasText(
            this.skFakeAppRecord.isBrandAbuse
              ? t('storeknox.brandAbuse')
              : t('storeknox.fakeApps.fakeApp')
          );
      }
    );

    // --- DetailsHeader: platform store logos ---

    test.each(
      'it renders the Play Store logo and hides the App Store logo for Android fake apps',
      ['android', 'apple'],
      async function (assert, platform) {
        const fakeApp = this.server.create('sk-fake-app', {
          sk_store: {
            platform:
              platform === 'android'
                ? ENUMS.PLATFORM.ANDROID
                : ENUMS.PLATFORM.IOS,
          },
        });

        this.set(
          'skFakeAppRecord',
          this.store.push(this.store.normalize('sk-fake-app', fakeApp.toJSON()))
        );

        await render(hbs`
          <Storeknox::FakeApps::Details
            @fakeApp={{this.skFakeAppRecord}}
            @skInventoryApp={{this.skInventoryAppRecord}}
          />
        `);

        const platformIconSelector = this.skFakeAppRecord.isAndroid
          ? '[data-test-storeknoxFakeAppsDetailsHeader-platformIcon]'
          : '[data-test-storeknoxFakeAppsDetailsHeader-appStoreLogo]';

        const storeLogoSelector = this.skFakeAppRecord.isAndroid
          ? '[data-test-storeknoxFakeAppsDetailsHeader-playStoreLogo]'
          : '[data-test-storeknoxFakeAppsDetailsHeader-appStoreLogo]';

        assert.dom(platformIconSelector).exists();
        assert.dom(storeLogoSelector).exists();
      }
    );

    // --- DetailsHeader: action buttons (not ignored) ---

    test('it renders the Ignore App and Ignore & Add to Inventory buttons when the fake app is not ignored', async function (assert) {
      // Render the component
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
        .isNotDisabled()
        .hasText(t('storeknox.ignoreApp'));

      assert
        .dom(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        )
        .isNotDisabled()
        .hasText(t('storeknox.ignoreAddToInventory'));
    });

    // --- DetailsHeader: ignored state ---

    test('it hides the header title section and action buttons when the fake app is ignored', async function (assert) {
      this.skFakeAppRecord.set('reviewedBy', 'user-123');

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-headerTitle]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        )
        .doesNotExist();
    });

    // --- IgnoreDrawer: opening ---

    test('it opens the ignore drawer with the Confirmation title and correct prompt when Ignore App is clicked', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]')
        .doesNotExist();

      await click('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]');

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]').exists();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
        .hasText(t('confirmation'));

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-prompt]')
        .containsText(this.skFakeApp.title);
    });

    test('it opens the ignore drawer with the Confirmation title and different prompt when Ignore & Add to Inventory is clicked', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]')
        .doesNotExist();

      await click(
        '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
      );

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]').exists();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
        .hasText(t('confirmation'));

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-prompt]')
        .containsText(this.skFakeApp.title);
    });

    // --- IgnoreDrawer: confirmation state interactions ---

    test('it renders the reason label, input, confirm and cancel buttons inside the drawer', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]');

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-reasonLabel]')
        .hasText(t('reason'));

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]')
        .exists()
        .hasNoValue();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .exists()
        .hasText(t('storeknox.yesIgnore'));

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-cancelBtn]')
        .exists()
        .hasText(t('cancel'));
    });

    test('it disables the confirm button when reason is empty and enables it after typing', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]');

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .isDisabled();

      await fillIn(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]',
        'Spam app'
      );

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .isNotDisabled();
    });

    test('it closes the ignore drawer when the cancel button is clicked', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]');

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]').exists();

      await click('[data-test-storeknoxFakeAppsIgnoreDrawer-cancelBtn]');

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]')
        .doesNotExist();
    });

    test('it closes the ignore drawer when the close button is clicked', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]');

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]').exists();

      await click('[data-test-storeknoxFakeAppsIgnoreDrawer-closeBtn]');

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-root]')
        .doesNotExist();
    });

    // --- IgnoreDrawer: already-ignored state ---

    test('it opens the drawer in ignored details mode when the fake app is already ignored', async function (assert) {
      const store = this.owner.lookup('service:store');
      const reviewedOn = new Date('2025-03-01T10:00:00Z');

      const ignoredFakeApp = this.server.create('sk-fake-app', {
        reviewed_by: 'user@example.com',
        reviewed_on: reviewedOn.toISOString(),
        ignore_reason: 'This is a known legitimate app',
        ai_classification_label: 'brand_abuse',
      });

      this.set(
        'skFakeAppRecord',
        store.push(store.normalize('sk-fake-app', ignoredFakeApp.toJSON()))
      );

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsDetailsHeader-viewDetailsBtn]');

      // Drawer title and close button
      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
        .hasText(t('storeknox.ignoredDetails'));

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-closeBtn]').exists();

      // Ignored On row
      const detailLabels = document.querySelectorAll(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-detailLabel]'
      );
      const detailValues = document.querySelectorAll(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-detailValue]'
      );

      assert.strictEqual(detailLabels.length, 3, 'renders 3 detail rows');

      assert.dom(detailLabels[0]).hasText(t('storeknox.ignoredOn'));

      assert
        .dom(detailValues[0])
        .hasText(dayjs(reviewedOn).format('MMMM D, YYYY'));

      // Ignored By row
      assert.dom(detailLabels[1]).hasText(t('storeknox.ignoredBy'));

      assert.dom(detailValues[1]).hasText('user@example.com');

      // Reason row
      assert.dom(detailLabels[2]).hasText(t('reason'));

      assert.dom(detailValues[2]).hasText('This is a known legitimate app');

      // Confirmation form elements are absent
      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-prompt]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-cancelBtn]')
        .doesNotExist();
    });

    // --- FindingsCard: count and structure ---

    test('it renders the correct title, score percentage and description for each findings card', async function (assert) {
      this.set(
        'skFakeAppRecord',
        this.store.push(
          this.store.normalize('sk-fake-app', this.skFakeApp.toJSON())
        )
      );

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      const scores = this.skFakeAppRecord.aiScores;
      const scoreLevels = this.skFakeAppRecord.aiScoreLevels;

      const aiClassificationJustification =
        this.skFakeAppRecord.aiClassificationJustification;

      // Counts
      assert
        .dom('[data-test-storeknoxFakeAppsFindingsCard-root]')
        .exists({ count: 7 });

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsCard-poweredByAiChip]')
        .exists({ count: 1 });

      // Cards order: Overall, Semantic, Logo, TitleBrandAbuse, Package, DeveloperConsistency, AppFunctionality
      const expectedCards = [
        {
          title: t('storeknox.fakeApps.overallScore'),
          score: calculateScorePercentage(scores.final),
          description: aiClassificationJustification,
        },
        {
          title: t('storeknox.fakeApps.semanticSimilarity'),
          score: capitalizeLevel(scoreLevels.SemanticSimilarityRule),
          description: scores.SemanticSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.logoSimilarity'),
          score: capitalizeLevel(scoreLevels.LogoSimilarityRule),
          description: scores.LogoSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.titleBrandAbuse'),
          score: capitalizeLevel(scoreLevels.TitleBrandAbuseRule),
          description: scores.TitleBrandAbuseRule_justification,
        },
        {
          title: t('storeknox.fakeApps.packageSimilarity'),
          score: capitalizeLevel(scoreLevels.PackageSimilarityRule),
          description: scores.PackageSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.developerConsistency'),
          score: capitalizeLevel(scoreLevels.DeveloperConsistencyRule),
          description: scores.DeveloperConsistencyRule_justification,
        },
        {
          title: t('storeknox.fakeApps.appFunctionalitySimilarity'),
          score: capitalizeLevel(scoreLevels.AppFunctionalitySimilarityRule),
          description: scores.AppFunctionalitySimilarityRule_justification,
        },
      ];

      expectedCards.forEach((cardInfo) => {
        const cardTitleSelector = `[data-test-storeknoxFakeAppsFindingsCard-title="${cardInfo.title}"]`;

        const card = find(cardTitleSelector);
        const { title, score, description } = cardInfo;

        assert
          .dom(cardTitleSelector)
          .containsText(title, `Card "${title}" title`);

        assert
          .dom('[data-test-storeknoxFakeAppsFindingsCard-score]', card)
          .containsText(score, `Card "${title}" score`);

        assert
          .dom('[data-test-storeknoxFakeAppsFindingsCard-description]', card)
          .containsText(description, `Card "${title}" description`);
      });
    });

    test('it dynamically renders the provided scores and descriptions for each findings card', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        ai_scores: {
          final: 0.8,
          SemanticSimilarityRule: 0.7,
          LogoSimilarityRule: 0.6,
          TitleBrandAbuseRule: 0.5,
          SemanticSimilarityRule_justification: 'Semantic Rule',
          LogoSimilarityRule_justification: 'Logo similarity description',
          TitleBrandAbuseRule_justification: 'Title brand abuse description',
        },
        ai_score_levels: {
          SemanticSimilarityRule: 'HIGH',
          LogoSimilarityRule: 'MEDIUM',
          TitleBrandAbuseRule: 'LOW',
        },
      });

      this.set(
        'skFakeAppRecord',
        this.store.push(this.store.normalize('sk-fake-app', fakeApp.toJSON()))
      );

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      // Cards order: Overall, Semantic, Logo, TitleBrandAbuse, Package, DeveloperConsistency, AppFunctionality
      const scores = this.skFakeAppRecord.aiScores;
      const scoreLevels = this.skFakeAppRecord.aiScoreLevels;

      const expectedCards = [
        {
          title: t('storeknox.fakeApps.overallScore'),
          score: calculateScorePercentage(scores.final),
          description: this.skFakeAppRecord.aiClassificationJustification,
        },
        {
          title: t('storeknox.fakeApps.semanticSimilarity'),
          score: capitalizeLevel(scoreLevels.SemanticSimilarityRule),
          description: scores.SemanticSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.logoSimilarity'),
          score: capitalizeLevel(scoreLevels.LogoSimilarityRule),
          description: scores.LogoSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.titleBrandAbuse'),
          score: capitalizeLevel(scoreLevels.TitleBrandAbuseRule),
          description: scores.TitleBrandAbuseRule_justification,
        },
        {
          title: t('storeknox.fakeApps.packageSimilarity'),
          score: capitalizeLevel(scoreLevels.PackageSimilarityRule),
          description: scores.PackageSimilarityRule_justification,
          doesNotExist: true,
        },
        {
          title: t('storeknox.fakeApps.developerConsistency'),
          score: capitalizeLevel(scoreLevels.DeveloperConsistencyRule),
          description: scores.DeveloperConsistencyRule_justification,
          doesNotExist: true,
        },
        {
          title: t('storeknox.fakeApps.appFunctionalitySimilarity'),
          score: capitalizeLevel(scoreLevels.AppFunctionalitySimilarityRule),
          description: scores.AppFunctionalitySimilarityRule_justification,
          doesNotExist: true,
        },
      ];

      // Counts
      assert.dom('[data-test-storeknoxFakeAppsFindingsCard-root]').exists({
        count: expectedCards.filter((cardInfo) => !cardInfo.doesNotExist)
          .length,
      });

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsCard-poweredByAiChip]')
        .exists({ count: 1 });

      // Cards
      expectedCards.forEach((cardInfo) => {
        const cardTitleSelector = `[data-test-storeknoxFakeAppsFindingsCard-title="${cardInfo.title}"]`;

        if (cardInfo.doesNotExist) {
          assert.dom(cardTitleSelector).doesNotExist();

          return;
        }

        const card = find(cardTitleSelector);
        const { title, score, description } = cardInfo;

        assert
          .dom(cardTitleSelector)
          .containsText(title, `Card "${title}" title`);

        assert
          .dom('[data-test-storeknoxFakeAppsFindingsCard-score]', card)
          .containsText(score, `Card "${title}" score`);

        assert
          .dom('[data-test-storeknoxFakeAppsFindingsCard-description]', card)
          .containsText(description, `Card "${title}" description`);
      });
    });

    // --- FindingsCard: ignored state ---

    test('it does not apply the ignored state to the findings container when the fake app is not ignored', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsDetails-findingsContainer]')
        .exists()
        .doesNotHaveClass(/is-ignored/);
    });

    test('it applies the ignored state to the findings container when the fake app is ignored', async function (assert) {
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

    // --- OriginalAppInfo: app details ---

    test('it renders the original app logo, title, package name and developer name', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

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
        .hasText(this.appMetadata.dev_name);

      const expectedDate = dayjs(
        this.skInventoryAppRecord.lastFakeDetectionOn
      ).format('MMM DD, YYYY');

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-lastMonitoringDate]')
        .hasText(expectedDate);
    });

    test('it renders the platform icon, Play Store logo and hides App Store logo for Android inventory apps', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

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

    test('it renders the App Store logo and hides the Play Store logo for iOS inventory apps', async function (assert) {
      const store = this.owner.lookup('service:store');

      const iosMetadata = this.server.create('sk-app-metadata', {
        platform: ENUMS.PLATFORM.IOS,
      });

      const iosInventoryApp = this.server.create('sk-inventory-app', {
        app_metadata: iosMetadata,
      });

      this.set(
        'skInventoryAppRecord',
        store.push(
          store.normalize('sk-inventory-app', {
            ...iosInventoryApp.toJSON(),
            app_metadata: iosMetadata.toJSON(),
          })
        )
      );

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-appStoreLogo]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsOriginalAppInfo-playStoreLogo]')
        .doesNotExist();
    });
  }
);
