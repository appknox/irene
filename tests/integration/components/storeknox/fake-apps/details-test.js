import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

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

    // --- Grouped analysis sections ---

    test('it renders three analysis group sections', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsGroup-root]')
        .exists({ count: 3 });
    });

    test('it renders the correct section titles for the three groups', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      const groupTitles = document.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsGroup-title]'
      );

      assert
        .dom(groupTitles[0])
        .hasText(t('storeknox.fakeApps.brandIdentityAnalysis'));
      assert
        .dom(groupTitles[1])
        .hasText(t('storeknox.fakeApps.binarySimilarityAnalysis'));
      assert
        .dom(groupTitles[2])
        .hasText(t('storeknox.fakeApps.securityRiskAssessment'));
    });

    test('it computes the correct section badge for Brand Identity using semanticAnalysisScore', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        semantic_analysis_score: 90,
        binary_similarity_score: 40,
        binary_risk_score: 10,
        ai_scores: {
          final: 0.9,
          SemanticSimilarityRule: 0.9,
          SemanticSimilarityRule_justification: 'High match',
          SigningCertRule: 0.3,
          SigningCertRule_justification: 'Different cert',
          SpecialPermissionsRule: 0.1,
          SpecialPermissionsRule_justification: 'No special perms',
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

      const badges = document.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsGroup-badge]'
      );

      // semanticAnalysisScore=90 >= 85 → HIGH → "High Match"
      assert.dom(badges[0]).hasText(t('storeknox.fakeApps.highMatch'));
      // binary_similarity_score=40 < 65 → LOW → "Low Similarity"
      assert.dom(badges[1]).hasText(t('storeknox.fakeApps.lowSimilarity'));
      // binary_risk_score=10 < 65 → LOW → "Low Risk"
      assert.dom(badges[2]).hasText(t('storeknox.fakeApps.lowRisk'));
    });

    test('it derives signal result label from numeric aiScore for Brand Identity signals', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        semantic_analysis_score: 50,
        binary_similarity_score: 50,
        binary_risk_score: 50,
        ai_scores: {
          final: 0.8,
          SemanticSimilarityRule: 0.9,
          SemanticSimilarityRule_justification: 'Very similar',
          LogoSimilarityRule: 0.7,
          LogoSimilarityRule_justification: 'Similar logo',
          PackageSimilarityRule: 0.3,
          PackageSimilarityRule_justification: 'Different package',
        },
        ai_score_levels: {
          SemanticSimilarityRule: 'HIGH',
          LogoSimilarityRule: 'MEDIUM',
          PackageSimilarityRule: 'LOW',
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

      // SemanticSimilarityRule=0.9 >= 0.85 → HIGH → "Strong Match"
      // Check the first group's signal rows directly
      const brandGroup = document.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsGroup-root]'
      )[0];

      const resultElements = brandGroup?.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsSignalRow-result]'
      );

      // Sorted by score descending: SemanticSimilarity(0.9)=Strong Match, Logo(0.7)=Partial Match, Package(0.3)=No Match
      assert
        .dom(resultElements?.[0])
        .hasText(t('storeknox.fakeApps.strongMatch'));
      assert
        .dom(resultElements?.[1])
        .hasText(t('storeknox.fakeApps.partialMatch'));
      assert.dom(resultElements?.[2]).hasText(t('storeknox.fakeApps.noMatch'));
    });

    test('it uses risk labels for Security Risk Assessment signals', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        semantic_analysis_score: 50,
        binary_similarity_score: 50,
        binary_risk_score: 50,
        ai_scores: {
          final: 0.8,
          SpecialPermissionsRule: 0.9,
          SpecialPermissionsRule_justification: 'Dangerous permission',
          ManifestFlagsRule: 0.5,
          ManifestFlagsRule_justification: 'Flags ok',
        },
        ai_score_levels: {
          SpecialPermissionsRule: 'HIGH',
          ManifestFlagsRule: 'LOW',
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

      const securityGroup = Array.from(
        document.querySelectorAll(
          '[data-test-storeknoxFakeAppsFindingsGroup-root]'
        )
      ).find((el) =>
        el
          .querySelector('[data-test-storeknoxFakeAppsFindingsGroup-title]')
          ?.textContent?.includes(
            t('storeknox.fakeApps.securityRiskAssessment')
          )
      );

      const resultElements = securityGroup?.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsSignalRow-result]'
      );

      // SpecialPermissionsRule=0.9 → HIGH → "Risk Detected"
      assert
        .dom(resultElements?.[0])
        .hasText(t('storeknox.fakeApps.riskDetected'));
      // ManifestFlagsRule=0.5 → LOW → "No Risk Detected"
      assert
        .dom(resultElements?.[1])
        .hasText(t('storeknox.fakeApps.noRiskDetected'));
    });

    // --- Security Risk Assessment: phase-2 signals ---

    test.each(
      'it renders each phase-2 security signal in the Security Risk Assessment group',
      [
        {
          rule: 'NativeLibsRule',
          titleKey: 'storeknox.fakeApps.nativeLibsAnalysis',
        },
        {
          rule: 'SuspiciousApiChainsRule',
          titleKey: 'storeknox.fakeApps.suspiciousApiChainsAnalysis',
        },
        {
          rule: 'ImplicitIntentsRule',
          titleKey: 'storeknox.fakeApps.implicitIntentsAnalysis',
        },
        {
          rule: 'NetworkEndpointsRule',
          titleKey: 'storeknox.fakeApps.networkEndpointsAnalysis',
        },
        {
          rule: 'PhishingDomainsRule',
          titleKey: 'storeknox.fakeApps.phishingDomainsAnalysis',
        },
        {
          rule: 'PackerDetectionRule',
          titleKey: 'storeknox.fakeApps.packerDetectionAnalysis',
        },
        {
          rule: 'EmbeddedFilesRule',
          titleKey: 'storeknox.fakeApps.embeddedFilesAnalysis',
        },
      ],
      async function (assert, { rule, titleKey }) {
        const fakeApp = this.server.create('sk-fake-app', {
          binary_risk_score: 80,
          ai_scores: {
            final: 0.8,
            [rule]: 0.9,
            [`${rule}_justification`]: 'Test justification',
          },
          ai_score_levels: { [rule]: 'HIGH' },
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

        const securityGroup = Array.from(
          document.querySelectorAll(
            '[data-test-storeknoxFakeAppsFindingsGroup-root]'
          )
        ).find((el) =>
          el
            .querySelector('[data-test-storeknoxFakeAppsFindingsGroup-title]')
            ?.textContent?.includes(
              t('storeknox.fakeApps.securityRiskAssessment')
            )
        );

        const titleElements = securityGroup?.querySelectorAll(
          '[data-test-storeknoxFakeAppsFindingsSignalRow-title]'
        );

        assert.ok(
          Array.from(titleElements ?? []).some((el) =>
            el.textContent?.includes(t(titleKey))
          ),
          `${rule} title is rendered`
        );
      }
    );

    test.each(
      'it maps each risk level to the correct label for PhishingDomainsRule',
      [
        { level: 'HIGH', expectedKey: 'storeknox.fakeApps.riskDetected' },
        { level: 'MEDIUM', expectedKey: 'storeknox.fakeApps.potentialRisk' },
        { level: 'LOW', expectedKey: 'storeknox.fakeApps.noRiskDetected' },
      ],
      async function (assert, { level, expectedKey }) {
        const score = level === 'HIGH' ? 0.9 : level === 'MEDIUM' ? 0.7 : 0.3;

        const fakeApp = this.server.create('sk-fake-app', {
          binary_risk_score: 50,
          ai_scores: {
            final: 0.8,
            PhishingDomainsRule: score,
            PhishingDomainsRule_justification: 'Phishing check result',
          },
          ai_score_levels: { PhishingDomainsRule: level },
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

        const securityGroup = Array.from(
          document.querySelectorAll(
            '[data-test-storeknoxFakeAppsFindingsGroup-root]'
          )
        ).find((el) =>
          el
            .querySelector('[data-test-storeknoxFakeAppsFindingsGroup-title]')
            ?.textContent?.includes(
              t('storeknox.fakeApps.securityRiskAssessment')
            )
        );

        const resultElements = securityGroup?.querySelectorAll(
          '[data-test-storeknoxFakeAppsFindingsSignalRow-result]'
        );

        assert.ok(
          Array.from(resultElements ?? []).some((el) =>
            el.textContent?.includes(t(expectedKey))
          ),
          `PhishingDomainsRule level ${level} renders "${t(expectedKey)}"`
        );
      }
    );

    test('it omits phase-2 security signals from the group when their score or level is absent', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        binary_risk_score: 50,
        ai_scores: {
          final: 0.8,
          SpecialPermissionsRule: 0.9,
          SpecialPermissionsRule_justification: 'Dangerous permission',
        },
        ai_score_levels: { SpecialPermissionsRule: 'HIGH' },
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

      const securityGroup = Array.from(
        document.querySelectorAll(
          '[data-test-storeknoxFakeAppsFindingsGroup-root]'
        )
      ).find((el) =>
        el
          .querySelector('[data-test-storeknoxFakeAppsFindingsGroup-title]')
          ?.textContent?.includes(
            t('storeknox.fakeApps.securityRiskAssessment')
          )
      );

      const signalRows = securityGroup?.querySelectorAll(
        '[data-test-storeknoxFakeAppsFindingsSignalRow-root]'
      );

      assert.strictEqual(
        signalRows?.length,
        1,
        'only the signal with data renders'
      );

      const allTitles = Array.from(
        securityGroup?.querySelectorAll(
          '[data-test-storeknoxFakeAppsFindingsSignalRow-title]'
        ) ?? []
      ).map((el) => el.textContent?.trim());

      assert.notOk(
        allTitles.some((title) =>
          title?.includes(t('storeknox.fakeApps.nativeLibsAnalysis'))
        ),
        'NativeLibsRule is absent without data'
      );

      assert.notOk(
        allTitles.some((title) =>
          title?.includes(t('storeknox.fakeApps.phishingDomainsAnalysis'))
        ),
        'PhishingDomainsRule is absent without data'
      );
    });

    // --- Signal detail drawer ---

    test('the signal detail drawer is closed by default', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::Details
          @fakeApp={{this.skFakeAppRecord}}
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-root]')
        .doesNotExist();
    });

    test('clicking a signal row expand button opens the drawer with the section title and signal details', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        semantic_analysis_score: 50,
        binary_similarity_score: 50,
        binary_risk_score: 50,
        ai_scores: {
          final: 0.8,
          SemanticSimilarityRule: 0.9,
          SemanticSimilarityRule_justification: 'Very similar brands',
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

      const firstExpandBtn = document
        .querySelectorAll('[data-test-storeknoxFakeAppsFindingsGroup-root]')[0]
        ?.querySelector(
          '[data-test-storeknoxFakeAppsFindingsSignalRow-expandBtn]'
        );

      await click(firstExpandBtn);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-root]')
        .exists('drawer opens');

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-title]')
        .hasText(
          t('storeknox.fakeApps.brandIdentityAnalysis'),
          'drawer title = section name'
        );

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-reasoning]')
        .hasText('Very similar brands', 'drawer shows justification');
    });

    test('closing the drawer resets it', async function (assert) {
      const fakeApp = this.server.create('sk-fake-app', {
        semantic_analysis_score: 50,
        binary_similarity_score: 50,
        binary_risk_score: 50,
        ai_scores: {
          final: 0.8,
          SemanticSimilarityRule: 0.9,
          SemanticSimilarityRule_justification: 'Very similar brands',
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

      const expandBtn = document
        .querySelectorAll('[data-test-storeknoxFakeAppsFindingsGroup-root]')[0]
        ?.querySelector(
          '[data-test-storeknoxFakeAppsFindingsSignalRow-expandBtn]'
        );

      await click(expandBtn);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-root]')
        .exists();

      await click('[data-test-storeknoxFakeAppsSignalDetailDrawer-closeBtn]');

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-root]')
        .doesNotExist('drawer closes');
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
