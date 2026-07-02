import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

class OrganizationStub extends Service {
  hideUpsellUI = false;
}

class SkOrganizationStub extends Service {
  selected = {
    skFeatures: {
      fake_app_detection: true,
    },
  };
}

module(
  'Integration | Component | storeknox/inventory-details/app-details/actions-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:sk-organization', SkOrganizationStub);

      const store = this.owner.lookup('service:store');

      const appMetadata = this.server.create('sk-app-metadata', {
        platform: ENUMS.PLATFORM.ANDROID,
      });

      this.store = store;
      this.appMetadata = appMetadata;

      this.createSkInventoryApp = (attrs) => {
        const skInventoryApp = this.server.create('sk-inventory-app', {
          app_metadata: this.appMetadata,
          ...attrs,
        });

        return this.store.push(
          this.store.normalize('sk-inventory-app', {
            ...skInventoryApp.toJSON(),
            app_metadata: this.appMetadata.toJSON(),
          })
        );
      };

      // Create and set default values for services
      const organizationService = this.owner.lookup('service:organization');
      const skOrganizationService = this.owner.lookup(
        'service:sk-organization'
      );

      organizationService.hideUpsellUI = false;
      skOrganizationService.selected = {
        skFeatures: { fake_app_detection: true },
      };

      // Default: monitoring enabled, no action needed, no results
      this.skInventoryAppRecord = this.createSkInventoryApp({
        monitoring_enabled: true,
        store_monitoring_status:
          ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
        fake_app_detection_status:
          ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
        has_store_monitoring_data: true,
        has_fake_app_detection_data: true,
      });
    });

    // --- header ---

    test('it renders the header icon and title', async function (assert) {
      this.set('skInventoryApp', this.skInventoryAppRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionListHeaderIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
        .containsText(t('storeknox.actionNeeded'));
    });

    // --- actionableItemsCount ---

    test('it does not show count when monitoring is disabled', async function (assert) {
      this.set(
        'skInventoryApp',
        this.createSkInventoryApp({
          monitoring_enabled: false,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
        })
      );

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
        .doesNotContainText('(');
    });

    test('it shows count when monitoring is enabled and actions are needed', async function (assert) {
      // Both unscanned-version and brand-abuse need action → count of 2
      this.set(
        'skInventoryApp',
        this.createSkInventoryApp({
          monitoring_enabled: true,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
          has_store_monitoring_data: true,
          has_fake_app_detection_data: true,
        })
      );

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
        .containsText('(2)');
    });

    test.each(
      'it shows count of 1 when only one button needs action',
      [
        {
          label: 'store monitoring',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
        },
        {
          label: 'brand abuse',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
          },
        },
      ],
      async function (assert, { attrs }) {
        this.set(
          'skInventoryApp',
          this.createSkInventoryApp({
            monitoring_enabled: true,
            has_store_monitoring_data: true,
            has_fake_app_detection_data: true,
            ...attrs,
          })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails::ActionsList
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        assert
          .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
          .containsText('(1)');
      }
    );

    // --- actionsList buttons ---

    test('it renders unscanned-version and brand-abuse buttons', async function (assert) {
      this.set('skInventoryApp', this.skInventoryAppRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-actionBtn="unscanned-version"]'
        )
        .containsText(t('storeknox.unscannedVersion'));

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn="brand-abuse"]')
        .containsText(t('storeknox.fakeAppsTitle'));
    });

    // --- malware-detected (hideUpsellUI) ---

    test('it renders the malware-detected button when hideUpsellUI is false', async function (assert) {
      this.set('skInventoryApp', this.skInventoryAppRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-actionBtn="malware-detected"]'
        )
        .exists()
        .containsText(t('storeknox.malwareDetected'));
    });

    test('it hides the malware-detected button when hideUpsellUI is true', async function (assert) {
      const organizationService = this.owner.lookup('service:organization');
      organizationService.hideUpsellUI = true;

      this.set('skInventoryApp', this.skInventoryAppRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-actionBtn="malware-detected"]'
        )
        .doesNotExist();
    });

    // --- org: fake_app_detection off (brand-abuse → inventory brand-abuse, not actionable) ---

    test('it renders brand-abuse as feature-in-progress with a link to inventory-details brand-abuse when fake_app_detection is off', async function (assert) {
      const skOrg = this.owner.lookup('service:sk-organization');
      skOrg.selected = { skFeatures: { fake_app_detection: false } };

      this.set('skInventoryApp', this.skInventoryAppRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      const btn = find(
        '[data-test-storeknoxInventoryDetails-actionBtn="brand-abuse"]'
      );

      assert.dom(btn).hasClass(/feature-in-progress/);

      const anchor = btn.closest('a');

      assert
        .dom(anchor)
        .hasAttribute(
          'href',
          `/dashboard/storeknox/inventory-details/${this.skInventoryApp.id}/brand-abuse`
        );
    });

    test('it only counts store monitoring when fake_app_detection is off (brand-abuse is not actionable)', async function (assert) {
      const skOrg = this.owner.lookup('service:sk-organization');
      skOrg.selected = { skFeatures: { fake_app_detection: false } };

      this.set(
        'skInventoryApp',
        this.createSkInventoryApp({
          monitoring_enabled: true,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
          has_store_monitoring_data: true,
          has_fake_app_detection_data: true,
        })
      );

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
        .containsText('(1)');
    });

    test('it shows no actionable count when only fake-app detection would need action but fake_app_detection is off', async function (assert) {
      const skOrg = this.owner.lookup('service:sk-organization');
      skOrg.selected = { skFeatures: { fake_app_detection: false } };

      this.set(
        'skInventoryApp',
        this.createSkInventoryApp({
          monitoring_enabled: true,
          store_monitoring_status:
            ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
          has_store_monitoring_data: true,
          has_fake_app_detection_data: true,
        })
      );

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
        .doesNotContainText('(');
    });

    test('it hides the brand-abuse button when fake_app_detection is off and hideUpsellUI is true', async function (assert) {
      const skOrg = this.owner.lookup('service:sk-organization');
      skOrg.selected = { skFeatures: { fake_app_detection: false } };

      const organizationService = this.owner.lookup('service:organization');
      organizationService.hideUpsellUI = true;

      this.set('skInventoryApp', this.skInventoryAppRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn="brand-abuse"]')
        .doesNotExist();
    });

    // --- statusIsInitializing ---

    test.each(
      'it disables the button when its status is initializing',
      [
        {
          btnKey: 'unscanned-version',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
        },
        {
          btnKey: 'brand-abuse',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
          },
        },
      ],
      async function (assert, { btnKey, attrs }) {
        this.set(
          'skInventoryApp',
          this.createSkInventoryApp({ monitoring_enabled: true, ...attrs })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails::ActionsList
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        assert
          .dom(`[data-test-storeknoxInventoryDetails-actionBtn="${btnKey}"]`)
          .isDisabled();
      }
    );

    // --- monitoring disabled ---

    test.each(
      'it disables the button and shows a tooltip when monitoring is disabled with no prior data',
      [
        {
          btnKey: 'unscanned-version',
          tooltipText: () => t('storeknox.noStoreMonitoringDataTooltip'),
          attrs: {
            has_store_monitoring_data: false,
            has_fake_app_detection_data: true,
          },
        },
        {
          btnKey: 'brand-abuse',
          tooltipText: () => t('storeknox.noFakeAppDetectionDataTooltip'),
          attrs: {
            has_store_monitoring_data: true,
            has_fake_app_detection_data: false,
          },
        },
        {
          btnKey: 'unscanned-version',
          isArchived: true,
          tooltipText: () => t('storeknox.noStoreMonitoringDataTooltip'),
          attrs: {
            has_store_monitoring_data: false,
            has_fake_app_detection_data: true,
          },
        },
        {
          btnKey: 'brand-abuse',
          isArchived: true,
          tooltipText: () => t('storeknox.noFakeAppDetectionDataTooltip'),
          attrs: {
            has_store_monitoring_data: true,
            has_fake_app_detection_data: false,
          },
        },
      ],
      async function (assert, { btnKey, isArchived, tooltipText, attrs }) {
        this.set(
          'skInventoryApp',
          this.createSkInventoryApp({
            monitoring_enabled: false,
            store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
            ...(isArchived
              ? {
                  app_status: ENUMS.SK_APP_STATUS.ARCHIVED,
                  archived_on: new Date().toISOString(),
                }
              : {}),
            ...attrs,
          })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails::ActionsList
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        const btnSelector = `[data-test-storeknoxInventoryDetails-actionBtn="${btnKey}"]`;

        assert.dom(btnSelector).isDisabled();

        if (isArchived) {
          assert.dom(btnSelector).hasClass(/archived/);
        }

        const tooltipEl = find(
          `[data-test-storeknoxInventoryDetails-actionBtnTooltip="${btnKey}"]`
        );

        await triggerEvent(tooltipEl, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .exists()
          .containsText(tooltipText());

        await triggerEvent(tooltipEl, 'mouseleave');
      }
    );

    test.each(
      'it keeps the button enabled and shows no tooltip when monitoring is disabled but prior data exists',
      [
        {
          btnKey: 'unscanned-version',
          attrs: {
            has_store_monitoring_data: true,
            has_fake_app_detection_data: false,
          },
        },
        {
          btnKey: 'brand-abuse',
          attrs: {
            has_store_monitoring_data: false,
            has_fake_app_detection_data: true,
          },
        },
      ],
      async function (assert, { btnKey, attrs }) {
        this.set(
          'skInventoryApp',
          this.createSkInventoryApp({
            monitoring_enabled: false,
            store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
            ...attrs,
          })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails::ActionsList
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        assert
          .dom(`[data-test-storeknoxInventoryDetails-actionBtn="${btnKey}"]`)
          .isNotDisabled();

        const tooltipEl = find(
          `[data-test-storeknoxInventoryDetails-actionBtnTooltip="${btnKey}"]`
        );

        await triggerEvent(tooltipEl, 'mouseenter');

        assert.dom('[data-test-ak-tooltip-content]').doesNotExist();

        await triggerEvent(tooltipEl, 'mouseleave');
      }
    );
  }
);
