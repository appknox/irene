import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import Service from '@ember/service';

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

class SkOrganizationStub extends Service {
  selected = {
    skFeatures: {
      fake_app_detection: true,
    },
  };
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
  reloadCalled = false;

  reload() {
    this.reloadCalled = true;
  }
}

module(
  'Integration | Component | storeknox/fake-apps/details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');
      this.owner.register('service:sk-organization', SkOrganizationStub);

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

      const skFakeAppsListService = new SkFakeAppsListServiceStub();

      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:sk-fake-apps-list', skFakeAppsListService, {
        instantiate: false,
      });

      this.setProperties({ store, skFakeAppsListService });
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
      'it renders the respective store logo for fake apps',
      [
        { identifier: 'playstore', platform: ENUMS.PLATFORM.ANDROID },
        { identifier: 'appstore', platform: ENUMS.PLATFORM.IOS },
        { identifier: 'apkmody', platform: ENUMS.PLATFORM.ANDROID },
        { identifier: 'aptoide', platform: ENUMS.PLATFORM.ANDROID },
      ],
      async function (assert, { identifier, platform }) {
        const fakeApp = this.server.create('sk-fake-app', {
          store: { identifier, platform, name: identifier },
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
          .dom('[data-test-storeknoxFakeAppsDetailsHeader-platformIcon]')
          .hasClass(platform === ENUMS.PLATFORM.ANDROID ? /android/ : /apple/);

        if (identifier === 'apkmody') {
          assert
            .dom('[data-test-storeknoxFakeAppsDetailsHeader-apkModyIcon]')
            .hasAttribute('src', '/images/apkmody-icon.png')
            .hasAttribute('alt', this.skFakeAppRecord.skStore.name);
        } else {
          assert
            .dom(
              `[data-test-storeknoxFakeAppsDetailsHeader-storeIcon='${identifier}']`
            )
            .exists();
        }
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

    test.each(
      'it keeps Ignore App enabled but disables Ignore & add to inventory for ApkMody/Aptoide and explains why in a tooltip',
      [
        { identifier: 'apkmody', label: 'ApkMody' },
        { identifier: 'aptoide', label: 'Aptoide' },
      ],
      async function (assert, { identifier, label }) {
        const fakeApp = this.server.create('sk-fake-app', {
          store: {
            identifier,
            platform: ENUMS.PLATFORM.ANDROID,
            name: label,
          },
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
          .dom('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]')
          .isNotDisabled(`${label}: ignore-only flow`);

        assert
          .dom(
            '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
          )
          .isDisabled(`${label}: add-to-inventory not available`);

        const addToInventoryBtn = find(
          '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
        );

        const tooltipRoot = addToInventoryBtn?.closest(
          '[data-test-ak-tooltip-root]'
        );

        assert.ok(tooltipRoot, `${label}: add-to-inventory wrapped in tooltip`);

        await triggerEvent(tooltipRoot, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .hasText(
            t('storeknox.fakeApps.cannotIgnoreNonAppStoreAndPlayStoreApps')
          );
      }
    );

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

    test('it shows the add-to-inventory confirm label on the drawer when opened from Ignore & add to inventory (DetailsHeader)', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        store: {
          identifier: 'playstore',
          platform: ENUMS.PLATFORM.ANDROID,
          name: 'Google Play',
        },
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

      await click(
        '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
      );

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .hasText(t('storeknox.yesIgnoreAndAddToInventory'));
    });

    // --- DetailsHeader: successful ignore submit (Mirage + reload + notify) ---

    test('it submits the ignore reason from the details header, closes the drawer, and reloads the list', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        sk_app: this.skInventoryApp.id,
        ai_classification_label: 'fake_app',
        store: {
          name: 'Google Play',
          identifier: 'playstore',
          platform: ENUMS.PLATFORM.ANDROID,
          platform_display: 'android',
        },
        reviewed_by: null,
        reviewed_on: null,
        ignore_reason: null,
        status: ENUMS.SK_FAKE_APP_STATUS.PENDING,
      });

      this.set(
        'skFakeAppRecord',
        this.store.push(
          this.store.normalize('sk-fake-app', {
            ...fakeApp.toJSON(),
            sk_app: this.skInventoryApp.id,
          })
        )
      );

      this.server.post(
        'v2/sk_app/:sk_app_id/sk_fake_app/:id/ignore',
        (schema, req) => {
          const found = schema.skFakeApps.find(req.params.id);

          return {
            ...found.toJSON(),
            status: ENUMS.SK_FAKE_APP_STATUS.IGNORED,
            reviewed_by: 'reviewer@example.com',
            reviewed_on: new Date().toISOString(),
            ignore_reason: JSON.parse(req.requestBody).ignore_reason,
          };
        }
      );

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsDetailsHeader-ignoreAppBtn]');

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

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, t('storeknox.fakeAppIgnored'));
    });

    test('it submits ignore and add to inventory from the details header, closes the drawer, and reloads the list', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        sk_app: this.skInventoryApp.id,
        ai_classification_label: 'fake_app',
        store: {
          name: 'Google Play',
          identifier: 'playstore',
          platform: ENUMS.PLATFORM.ANDROID,
          platform_display: 'android',
        },
        reviewed_by: null,
        reviewed_on: null,
        ignore_reason: null,
        status: ENUMS.SK_FAKE_APP_STATUS.PENDING,
      });

      this.set(
        'skFakeAppRecord',
        this.store.push(
          this.store.normalize('sk-fake-app', {
            ...fakeApp.toJSON(),
            sk_app: this.skInventoryApp.id,
          })
        )
      );

      this.server.post(
        'v2/sk_app/:sk_app_id/sk_fake_app/:id/add_to_inventory',
        (schema, req) => {
          const found = schema.skFakeApps.find(req.params.id);

          return {
            ...found.toJSON(),
            status: ENUMS.SK_FAKE_APP_STATUS.ADDED_TO_INVENTORY,
            reviewed_by: 'reviewer@example.com',
            reviewed_on: new Date().toISOString(),
            ignore_reason: JSON.parse(req.requestBody).ignore_reason,
            added_to_inventory_app: Number(this.skInventoryApp.id),
          };
        }
      );

      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      await click(
        '[data-test-storeknoxFakeAppsDetailsHeader-ignoreAddToInventoryBtn]'
      );

      await fillIn(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]',
        'Legitimate copy'
      );

      await click('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]');

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
        .doesNotExist('drawer closes after successful add to inventory');

      assert.true(
        this.skFakeAppsListService.reloadCalled,
        'list reload was triggered'
      );

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('storeknox.fakeAppIgnoredAndAddedToInventory')
      );
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
      // Use deterministic, non-zero scores to avoid flakiness.
      // The component filters out cards whose numeric score is falsy (=== 0),
      // so random faker scores can randomly produce 6 instead of 7 cards.
      const fakeApp = this.server.create('sk-fake-app', {
        ai_scores: {
          final: 0.82,
          SemanticSimilarityRule: 0.75,
          LogoSimilarityRule: 0.65,
          TitleBrandAbuseRule: 0.55,
          PackageSimilarityRule: 0.45,
          DeveloperConsistencyRule: 0.35,
          AppFunctionalitySimilarityRule: 0.25,
          SemanticSimilarityRule_justification: 'Semantic justification',
          LogoSimilarityRule_justification: 'Logo justification',
          TitleBrandAbuseRule_justification: 'Title justification',
          PackageSimilarityRule_justification: 'Package justification',
          DeveloperConsistencyRule_justification: 'Developer justification',
          AppFunctionalitySimilarityRule_justification:
            'Functional justification',
        },
        ai_score_levels: {
          SemanticSimilarityRule: 'HIGH',
          LogoSimilarityRule: 'MEDIUM',
          TitleBrandAbuseRule: 'LOW',
          PackageSimilarityRule: 'MEDIUM',
          DeveloperConsistencyRule: 'HIGH',
          AppFunctionalitySimilarityRule: 'LOW',
        },
        ai_classification_justification: 'Overall classification justification',
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

      // Cards order: Overall first, then level cards sorted HIGH → MEDIUM → LOW
      const expectedCards = [
        {
          title: t('storeknox.fakeApps.overallScore'),
          score: calculateScorePercentage(scores.final),
          description: aiClassificationJustification,
        },
        {
          title: t('storeknox.fakeApps.brandAnalysis'),
          score: capitalizeLevel(scoreLevels.SemanticSimilarityRule),
          description: scores.SemanticSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.logoAnalysis'),
          score: capitalizeLevel(scoreLevels.LogoSimilarityRule),
          description: scores.LogoSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.appNameAnalysis'),
          score: capitalizeLevel(scoreLevels.TitleBrandAbuseRule),
          description: scores.TitleBrandAbuseRule_justification,
        },
        {
          title: t('storeknox.fakeApps.packageAnalysis'),
          score: capitalizeLevel(scoreLevels.PackageSimilarityRule),
          description: scores.PackageSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.publisherAnalysis'),
          score: capitalizeLevel(scoreLevels.DeveloperConsistencyRule),
          description: scores.DeveloperConsistencyRule_justification,
        },
        {
          title: t('storeknox.fakeApps.functionalAnalysis'),
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

      // Cards order: Overall first, then sorted by numeric aiScore descending
      // Semantic=0.7 (HIGH), Logo=0.6 (MEDIUM), TitleBrandAbuse=0.5 (LOW)
      const scores = this.skFakeAppRecord.aiScores;
      const scoreLevels = this.skFakeAppRecord.aiScoreLevels;

      const expectedCards = [
        {
          title: t('storeknox.fakeApps.overallScore'),
          score: calculateScorePercentage(scores.final),
          description: this.skFakeAppRecord.aiClassificationJustification,
        },
        {
          title: t('storeknox.fakeApps.brandAnalysis'),
          score: capitalizeLevel(scoreLevels.SemanticSimilarityRule), // HIGH
          description: scores.SemanticSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.logoAnalysis'),
          score: capitalizeLevel(scoreLevels.LogoSimilarityRule), // MEDIUM
          description: scores.LogoSimilarityRule_justification,
        },
        {
          title: t('storeknox.fakeApps.appNameAnalysis'),
          score: capitalizeLevel(scoreLevels.TitleBrandAbuseRule), // LOW
          description: scores.TitleBrandAbuseRule_justification,
        },
        {
          title: t('storeknox.fakeApps.packageAnalysis'),
          score: capitalizeLevel(scoreLevels.PackageSimilarityRule),
          description: scores.PackageSimilarityRule_justification,
          doesNotExist: true,
        },
        {
          title: t('storeknox.fakeApps.publisherAnalysis'),
          score: capitalizeLevel(scoreLevels.DeveloperConsistencyRule),
          description: scores.DeveloperConsistencyRule_justification,
          doesNotExist: true,
        },
        {
          title: t('storeknox.fakeApps.functionalAnalysis'),
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

      // Cards: content
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

      // Sort order: Overall first, then descending by numeric aiScore (0.7 → 0.6 → 0.5)
      const renderedCards = document.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsCard-root]'
      );

      assert
        .dom(
          '[data-test-storeknoxFakeAppsFindingsCard-score]',
          renderedCards[0]
        )
        .containsText(
          calculateScorePercentage(scores.final),
          'Overall card is first'
        );

      assert
        .dom(
          '[data-test-storeknoxFakeAppsFindingsCard-score]',
          renderedCards[1]
        )
        .containsText('High', 'Highest numeric score (0.7) card is second');

      assert
        .dom(
          '[data-test-storeknoxFakeAppsFindingsCard-score]',
          renderedCards[2]
        )
        .containsText('Medium', 'Middle numeric score (0.6) card is third');

      assert
        .dom(
          '[data-test-storeknoxFakeAppsFindingsCard-score]',
          renderedCards[3]
        )
        .containsText('Low', 'Lowest numeric score (0.5) card is fourth');
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
        .hasAttribute('src', this.appMetadata.icon_url);

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
