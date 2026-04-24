import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

class SkOrganizationStub extends Service {
  selected = {
    skFeatures: {
      fake_app_detection: true,
    },
  };
}

module(
  'Integration | Component | storeknox/inventory/app-list/table/monitoring-status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:sk-organization', SkOrganizationStub);

      const store = this.owner.lookup('service:store');
      const appMetadata = this.server.create('sk-app-metadata');

      this.createFakeApp = (attrs = {}) => {
        const skApp = this.server.create('sk-inventory-app', {
          app_metadata: appMetadata,
          ...attrs,
        });

        return store.push(
          store.normalize('sk-inventory-app', {
            ...skApp.toJSON(),
            app_metadata: appMetadata.toJSON(),
          })
        );
      };
    });

    // --- Status icon and text ---

    test.each(
      'it renders the correct status icon and label',
      [
        {
          label: 'disabled',
          attrs: {
            monitoring_enabled: false,
            store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
          },
          expectedIcon: 'disabled',
          expectedTextKey: 'disabled',
        },
        {
          label: 'action needed (unscanned versions)',
          attrs: {
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
          expectedIcon: 'action-needed',
          expectedTextKey: 'storeknox.needsAction',
        },
        {
          label: 'action needed (fake apps)',
          attrs: {
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
          },
          expectedIcon: 'action-needed',
          expectedTextKey: 'storeknox.needsAction',
        },
        {
          label: 'initializing',
          attrs: {
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
          },
          expectedIcon: 'initializing',
          expectedTextKey: 'storeknox.beingInitialized',
        },
        {
          label: 'no action needed',
          attrs: {
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
          expectedIcon: 'no-action-needed',
          expectedTextKey: 'storeknox.noActionNeeded',
        },
      ],
      async function (assert, { label, attrs, expectedIcon, expectedTextKey }) {
        this.set('app', this.createFakeApp(attrs));

        await render(hbs`
          <Storeknox::Inventory::AppList::Table::MonitoringStatus
            @app={{this.app}}
            @loading={{false}}
          />
        `);

        assert
          .dom(
            `[data-test-storeknoxInventory-appListTable-monitoringStatusIcon="${expectedIcon}"]`
          )
          .exists(`${label}: correct icon rendered`);

        assert
          .dom(
            '[data-test-storeknoxInventory-appListTable-monitoringStatusText]'
          )
          .containsText(t(expectedTextKey), `${label}: correct label`);
      }
    );

    // --- Tooltip messages ---

    test('it shows the disabled tooltip when monitoring is off', async function (assert) {
      this.set(
        'app',
        this.createFakeApp({
          monitoring_enabled: false,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
        })
      );

      await render(hbs`
        <Storeknox::Inventory::AppList::Table::MonitoringStatus
          @app={{this.app}}
          @loading={{false}}
        />
      `);

      const trigger = find(
        '[data-test-storeknoxInventory-appListTable-monitoringStatusText]'
      );

      await triggerEvent(trigger, 'mouseenter');

      assert
        .dom(
          '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipText]'
        )
        .containsText(t('storeknox.disabledMsg'));

      await triggerEvent(trigger, 'mouseleave');
    });

    test.each(
      'it shows the correct warning tooltip when actions are needed',
      [
        {
          label: 'both unscanned versions and fake apps',
          attrs: {
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
          },
          expectedTooltipKey:
            'storeknox.unscannedVersionsAndFakeAppsDetectedTitle',
        },
        {
          label: 'fake apps only',
          attrs: {
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
          },
          expectedTooltipKey: 'storeknox.fakeAppsDetectedTitle',
        },
        {
          label: 'unscanned versions only',
          attrs: {
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
          expectedTooltipKey: 'storeknox.unscannedVersionsTitle',
        },
      ],
      async function (assert, { attrs, expectedTooltipKey }) {
        this.set('app', this.createFakeApp(attrs));

        await render(hbs`
          <Storeknox::Inventory::AppList::Table::MonitoringStatus
            @app={{this.app}}
            @loading={{false}}
          />
        `);

        const trigger = find(
          '[data-test-storeknoxInventory-appListTable-monitoringStatusText]'
        );

        await triggerEvent(trigger, 'mouseenter');

        // All warning tooltip keys use htmlSafe: true in the component
        compareInnerHTMLWithIntlTranslation(assert, {
          selector:
            '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipText]',
          message: t(expectedTooltipKey),
          doIncludesCheck: true,
        });

        await triggerEvent(trigger, 'mouseleave');
      }
    );

    // --- Tooltip: fake_app_detection feature flag ---

    test.each(
      'it shows the correct "no action needed" tooltip based on the fake_app_detection feature flag',
      [
        {
          label: 'feature enabled',
          fakeAppDetection: true,
          expectedTooltipKey:
            'storeknox.noUnscannedVersionsOrFakeAppsDetectedMsg',
        },
        {
          label: 'feature disabled',
          fakeAppDetection: false,
          expectedTooltipKey: 'storeknox.noUnscannedVersions',
        },
      ],
      async function (assert, { fakeAppDetection, expectedTooltipKey }) {
        const skOrgService = this.owner.lookup('service:sk-organization');

        skOrgService.selected = {
          skFeatures: { fake_app_detection: fakeAppDetection },
        };

        this.set(
          'app',
          this.createFakeApp({
            monitoring_enabled: true,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          })
        );

        await render(hbs`
          <Storeknox::Inventory::AppList::Table::MonitoringStatus
            @app={{this.app}}
            @loading={{false}}
          />
        `);

        const trigger = find(
          '[data-test-storeknoxInventory-appListTable-monitoringStatusText]'
        );

        await triggerEvent(trigger, 'mouseenter');

        // Both tooltip keys use htmlSafe: true in the component
        compareInnerHTMLWithIntlTranslation(assert, {
          selector:
            '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipText]',
          message: t(expectedTooltipKey),
          doIncludesCheck: true,
        });

        await triggerEvent(trigger, 'mouseleave');
      }
    );

    // --- Initializing tooltip sub-variants ---

    test.each(
      'it shows the correct initializing tooltip based on which service is initializing',
      [
        {
          label: 'both initializing',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
          },
          expectedTooltipKey: 'storeknox.initializingMsg',
          isHtmlSafe: false,
        },
        {
          label:
            'fake app detection initializing, store monitoring not disabled',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
          },
          expectedTooltipKey: 'storeknox.initializingMsgFakeApp',
          isHtmlSafe: true,
        },
        {
          label:
            'store monitoring initializing, fake app detection not disabled',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
          expectedTooltipKey: 'storeknox.initializingMsgStoreMonitoring',
          isHtmlSafe: true,
        },
      ],
      async function (
        assert,
        { label, attrs, expectedTooltipKey, isHtmlSafe }
      ) {
        this.set(
          'app',
          this.createFakeApp({ monitoring_enabled: true, ...attrs })
        );

        await render(hbs`
          <Storeknox::Inventory::AppList::Table::MonitoringStatus
            @app={{this.app}}
            @loading={{false}}
          />
        `);

        const trigger = find(
          '[data-test-storeknoxInventory-appListTable-monitoringStatusText]'
        );

        await triggerEvent(trigger, 'mouseenter');

        const tooltipSelector =
          '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipText]';

        if (isHtmlSafe) {
          compareInnerHTMLWithIntlTranslation(assert, {
            selector: tooltipSelector,
            message: t(expectedTooltipKey),
            doIncludesCheck: true,
          });
        } else {
          assert
            .dom(tooltipSelector)
            .containsText(t(expectedTooltipKey), `${label}: correct tooltip`);
        }

        await triggerEvent(trigger, 'mouseleave');
      }
    );

    // --- Loading state ---

    test('it renders skeleton elements when loading is true', async function (assert) {
      this.set('app', this.createFakeApp());

      await render(hbs`
        <Storeknox::Inventory::AppList::Table::MonitoringStatus
          @app={{this.app}}
          @loading={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventory-appListTable-monitoringStatusIcon]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxInventory-appListTable-monitoringStatusText]')
        .doesNotExist();
    });
  }
);
