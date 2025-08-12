import { visit, findAll, find, triggerEvent, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';
import ENUMS from 'irene/enums';

// Notification Service
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

// NOT_FOUND: 0,
// NO_ACTION_NEEDED: 1,
// DISABLED: 2,
// INITIALIZING: 3,
// ACTION_NEEDED: 4,

// Filter Enums and Monitoring Status Enums
const MONITORING_STATUSES = {
  UNSCANNED: ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
  SCANNED: ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
  PENDING: ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
};

const MONITORING_STATUS_FILTERS = {
  ALL: -1,
  DISABLED: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
  INITIALIZING: ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
  ACTION_NEEDED: ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
  NO_ACTION_NEEDED: ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
};

// App Config for different monitoring statuses
const inventoryAppMonitoringStatusConfig = [
  {
    store_monitoring_status: MONITORING_STATUSES.UNSCANNED,
    icon_key: 'action-needed',
    monitoring_enabled: true,
    status_text: () => t('storeknox.needsAction'),
    tooltip: {
      message: () => t('storeknox.actionsNeededMsg'),
      subtext: () => t('storeknox.haveBeenDetected'),
    },
  },
  {
    store_monitoring_status: MONITORING_STATUSES.SCANNED,
    icon_key: 'no-action-needed',
    monitoring_enabled: true,
    status_text: () => t('storeknox.noActionNeeded'),
    tooltip: {
      message: () => t('storeknox.noActionsNeededMsg'),
      subtext: () => t('storeknox.haveBeenDetected'),
    },
  },
  {
    store_monitoring_status: MONITORING_STATUSES.PENDING,
    icon_key: 'initializing',
    monitoring_enabled: true,
    status_text: () => t('storeknox.beingInitialized'),
    tooltip: {
      message: () => t('storeknox.initializingMsg'),
    },
  },
  {
    store_monitoring_status: MONITORING_STATUSES.PENDING,
    icon_key: 'disabled',
    monitoring_enabled: false,
    status_text: () => t('disabled'),
    tooltip: {
      message: () => t('storeknox.disabledMsg'),
    },
  },
];

module('Acceptance | storeknox/inventory/app-list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe, currentSkOrganization } =
      await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        storeknox: true,
      },
    });

    // Server mocks
    this.server.get('v2/sk_app', () => {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });

    // Services
    this.owner.register('service:notifications', NotificationsStub);

    this.setProperties({ currentOrganizationMe, currentSkOrganization });
  });

  /**
   *  ==============================
   *  Helper Functions
   *  ==============================
   */

  /**
   * Opens the monitoring status filter popover
   * @param {QUnit.Asserter} assert - The QUnit assert object
   */
  const openMonitoringStatusFilter = async (assert) => {
    await click(
      '[data-test-storeknoxinventory-appListTable-monitoringstatus-header-icon]'
    );

    assert
      .dom(
        '[data-test-storeknoxinventory-appListTable-monitoringstatus-header-popover]'
      )
      .exists();

    assert
      .dom(
        '[data-test-storeknoxInventory-appListTable-monitoringStatus-header-popover-headerText]'
      )
      .hasText(t('status'));
  };

  /**
   * Filters the inventory apps by monitoring status
   * @param {Object} a - The inventory app object
   * @param {number} filterValue - The filter value
   */
  const filterAppsByMonitoringStatus = (a, filterValue) => {
    const { store_monitoring_status, monitoring_enabled } = a;

    const isPending = store_monitoring_status === MONITORING_STATUSES.PENDING;

    // No filter applied
    if (filterValue === -1) {
      return true;
    }

    // Action needed filter applied
    if (filterValue === MONITORING_STATUS_FILTERS.ACTION_NEEDED) {
      return store_monitoring_status === MONITORING_STATUSES.UNSCANNED;
    }

    // Disabled filter applied
    if (filterValue === MONITORING_STATUS_FILTERS.DISABLED) {
      return isPending && monitoring_enabled === false;
    }

    // Initializing filter applied
    if (filterValue === MONITORING_STATUS_FILTERS.INITIALIZING) {
      return isPending && monitoring_enabled === true;
    }

    // No action needed filter applied
    return store_monitoring_status === MONITORING_STATUSES.SCANNED;
  };

  /**
   * Confirms the rendered app data
   * @param {QUnit.Asserter} assert - The QUnit assert object
   * @param {Element} appElement - The app element
   * @param {Object} appMetadata - The app metadata
   * @param {Object} options - The options object
   * @param {string} options.icon_key - The icon key
   * @param {string} options.status_text - The status text
   * @param {Object} options.status_tooltip_info - The status tooltip info
   */
  const confirmRenderedAppData = async (
    assert,
    appElement,
    appMetadata,
    { icon_key, status_text, status_tooltip_info }
  ) => {
    if (appMetadata.platform === ENUMS.PLATFORM.ANDROID) {
      assert
        .dom(
          '[data-test-storeknoxTableColumns-store-playStoreIcon]',
          appElement
        )
        .exists();
    } else {
      assert
        .dom('[data-test-storeknoxTableColumns-store-iosIcon]', appElement)
        .exists();
    }

    assert
      .dom('[data-test-storeknoxTableColumns-applicationDevName]', appElement)
      .hasText(appMetadata.dev_name);

    assert
      .dom('[data-test-storeknoxTableColumns-applicationDevEmail]', appElement)
      .hasText(appMetadata.dev_email);

    assert
      .dom('[data-test-storeknoxTableColumns-applicationTitle]', appElement)
      .hasText(appMetadata.title);

    assert
      .dom(
        '[data-test-storeknoxTableColumns-applicationPackageName]',
        appElement
      )
      .hasText(appMetadata.package_name);

    assert
      .dom('[data-test-applogo-img]', appElement)
      .hasAttribute('src', appMetadata.icon_url);

    const iconElement = `[data-test-storeknoxInventory-appListTable-monitoringStatusIcon='${icon_key}']`;

    assert.dom(iconElement, appElement).exists();

    assert
      .dom(
        '[data-test-storeknoxInventory-appListTable-monitoringStatusText]',
        appElement
      )
      .hasText(status_text());

    // Check for monitoring status tooltip
    const monitoringStatusIconElement = find(iconElement);
    const tooltipContentSelector = '[data-test-ak-tooltip-content]';

    const statusTooltipContentSelector =
      '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipText]';

    await triggerEvent(monitoringStatusIconElement, 'mouseenter');

    assert.dom(tooltipContentSelector).exists();

    assert
      .dom(
        '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipHeaderText]'
      )
      .hasText(t('reason'));

    compareInnerHTMLWithIntlTranslation(assert, {
      selector: statusTooltipContentSelector,
      message: status_tooltip_info.message(),
      doIncludesCheck: true,
    });

    // Check for subtext if present. Available only for needs action and no action needed tooltips
    if (status_tooltip_info.subtext) {
      assert
        .dom(statusTooltipContentSelector)
        .containsText(status_tooltip_info.subtext());
    }

    await triggerEvent(monitoringStatusIconElement, 'mouseleave');
  };

  /**
   *  ==============================
   *  Test: Renders without approved apps
   *  ==============================
   */
  test.each(
    'it renders without approved apps',
    [{ is_owner: true }, { is_owner: false }],
    async function (assert, { is_owner }) {
      this.currentOrganizationMe.update({ is_owner });

      await visit('/dashboard/storeknox/inventory/app-list');

      assert
        .dom('[data-test-storeknoxInventory-inventoryHeaderText]')
        .hasText(t('storeknox.inventoryHeader'));

      assert
        .dom('[data-test-storeknoxInventory-inventoryDescriptionText]')
        .hasText(t('storeknox.inventoryDescription'));

      assert
        .dom('[data-test-storeknoxInventory-discoveryPageLink]')
        .hasText(t('storeknox.discoverHeader'));

      // Tab items check
      const tabItems = [
        {
          id: 'app-inventory',
          label: t('storeknox.appInventory'),
        },

        // Pending Review apps tab should be displayed for only owners
        this.currentOrganizationMe.is_owner && {
          id: 'pending-review',
          label: t('storeknox.pendingReview'),
        },
      ];

      tabItems
        .filter(Boolean)
        .forEach((tab) =>
          assert
            .dom(`[data-test-storeknoxInventory-tabs='${tab.id}-tab']`)
            .hasText(tab.label)
        );

      // Empty state
      assert
        .dom(
          '[data-test-storeknoxInventory-appListTable-tableEmptyIllustration]'
        )
        .exists();

      assert
        .dom('[data-test-storeknoxInventory-appListTable-tableEmptyHeaderText]')
        .hasText(t('storeknox.noInventoryAppsFound'));

      compareInnerHTMLWithIntlTranslation(assert, {
        message: t('storeknox.noInventoryAppsFoundDescription'),
        selector:
          '[data-test-storeknoxInventory-appListTable-tableEmptyHeaderDescription]',
      });

      // Settings toggle check
      if (is_owner) {
        assert
          .dom('[data-test-storeknoxInventory-settingsDrawerTrigger]')
          .exists();
      } else {
        assert
          .dom('[data-test-storeknoxInventory-settingsDrawerTrigger]')
          .doesNotExist();
      }
    }
  );

  /**
   *  ==============================
   *  Test: Toggles adding appknox app to inventory by default if user is owner
   *  ==============================
   */
  test.each(
    'it toggles adding appknox app to inventory by default if user is owner',
    [
      { fail: true },
      {
        fail: false,
        error: { detail: 'disconnect error' },
      },
    ],
    async function (assert, { fail, error }) {
      assert.expect();

      this.owner.register('service:notifications', NotificationsStub);

      // Models
      this.currentOrganizationMe.update({ is_owner: true });

      this.currentSkOrganization.update({
        add_appknox_project_to_inventory_by_default: false,
      });

      // Server Mocks
      this.server.get('/v2/sk_organization', (schema) => {
        const skOrganizations = schema.skOrganizations.all().models;

        return {
          count: skOrganizations.length,
          next: null,
          previous: null,
          results: skOrganizations,
        };
      });

      this.server.patch('/v2/sk_organization/:id', (schema, req) => {
        if (fail) {
          return new Response(400, {}, error);
        }

        const { add_appknox_project_to_inventory_by_default } = JSON.parse(
          req.requestBody
        );

        // Request is made by the selected org
        assert.strictEqual(this.currentSkOrganization.id, req.params.id);

        // Toggle value is opposite of what is default
        assert.strictEqual(
          add_appknox_project_to_inventory_by_default,
          !this.currentSkOrganization
            .add_appknox_project_to_inventory_by_default
        );

        const skOrg = schema.db.skOrganizations.update(`${req.params.id}`, {
          add_appknox_project_to_inventory_by_default,
        });

        return skOrg;
      });

      // Test Start
      await visit('/dashboard/storeknox/inventory/app-list');

      assert
        .dom('[data-test-storeknoxInventory-settingsDrawerTrigger]')
        .exists();

      await click('[data-test-storeknoxInventory-settingsDrawerTrigger]');

      assert
        .dom('[data-test-storeknoxInventory-settingsDrawer-closeIconBtn]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventory-settingsDrawer-title]')
        .hasText(t('storeknox.inventorySettings'));

      assert
        .dom(
          '[data-test-storeknoxInventory-settingsDrawer-addAppknoxProjectsByDefaultTitle]'
        )
        .hasText(t('storeknox.addAppknoxProjectsByDefault'));

      assert
        .dom(
          '[data-test-storeknoxInventory-settingsDrawer-addAppknoxProjectsByDefaultDesc]'
        )
        .containsText(t('storeknox.addVAPTPrjsByDefaultToggleDesc1'))
        .containsText(t('storeknox.addVAPTPrjsByDefaultToggleDesc2'));

      assert
        .dom(
          '[data-test-storeknoxInventory-settingsDrawer-addAppknoxProjectsByDefaultDescVAPTLink]'
        )
        .hasText(t('vapt'));

      const addAppknoxProjectsByDefaultToggle =
        '[data-test-storeknoxInventory-settingsDrawer-addAppknoxProjectsByDefaultToggle] [data-test-toggle-input]';

      assert.dom(addAppknoxProjectsByDefaultToggle).isNotChecked();

      await click(addAppknoxProjectsByDefaultToggle);

      assert.dom(addAppknoxProjectsByDefaultToggle).isChecked();
    }
  );

  /**
   *  ==============================
   *  Test: Renders with approved app statuses
   *  ==============================
   */
  test.each(
    'it toggles auto discovery enabled',
    [
      { fail: true },
      {
        fail: false,
        error: { detail: 'disconnect error' },
      },
    ],
    async function (assert, { fail, error }) {
      assert.expect();

      this.owner.register('service:notifications', NotificationsStub);

      // Models
      this.currentOrganizationMe.update({ is_owner: true });

      this.currentSkOrganization.update({
        auto_discovery_enabled: false,
      });

      // Server Mocks
      this.server.get('/v2/sk_organization', (schema) => {
        const skOrganizations = schema.skOrganizations.all().models;

        return {
          count: skOrganizations.length,
          next: null,
          previous: null,
          results: skOrganizations,
        };
      });

      this.server.patch('/v2/sk_organization/:id', (schema, req) => {
        if (fail) {
          return new Response(400, {}, error);
        }

        const { auto_discovery_enabled } = JSON.parse(req.requestBody);

        // Request is made by the selected org
        assert.strictEqual(this.currentSkOrganization.id, req.params.id);

        // Toggle value is opposite of what is default
        assert.strictEqual(
          auto_discovery_enabled,
          !this.currentSkOrganization.auto_discovery_enabled
        );

        const skOrg = schema.db.skOrganizations.update(`${req.params.id}`, {
          auto_discovery_enabled,
        });

        return skOrg;
      });

      // Test Start
      await visit('/dashboard/storeknox/inventory/app-list');

      assert
        .dom('[data-test-storeknoxInventory-settingsDrawerTrigger]')
        .exists();

      await click('[data-test-storeknoxInventory-settingsDrawerTrigger]');

      assert
        .dom('[data-test-storeknoxInventory-settingsDrawer-closeIconBtn]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventory-settingsDrawer-title]')
        .hasText(t('storeknox.inventorySettings'));

      assert
        .dom(
          '[data-test-storeknoxInventory-settingsDrawer-autoDiscoveryEnabledHeading]'
        )
        .hasText(t('storeknox.autoDiscovery'));

      assert
        .dom(
          '[data-test-storeknoxInventory-settingsDrawer-autoDiscoveryEnabledHeadingDesc]'
        )
        .hasText(t('storeknox.autoDiscoveryToggleDesc'));

      const autoDiscoveryEnabledToggle =
        '[data-test-storeknoxInventory-settingsDrawer-autoDiscoveryEnabledHeadingToggle] [data-test-toggle-input]';

      assert.dom(autoDiscoveryEnabledToggle).isNotChecked();

      await click(autoDiscoveryEnabledToggle);

      assert.dom(autoDiscoveryEnabledToggle).isChecked();
    }
  );

  test.each(
    'it renders with approved app statuses',
    inventoryAppMonitoringStatusConfig,
    async function (
      assert,
      {
        store_monitoring_status,
        icon_key,
        monitoring_enabled,
        status_text,
        tooltip,
      }
    ) {
      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        { store_monitoring_status, monitoring_enabled }
      );

      // Server mocks
      this.server.get('v2/sk_app', (schema, req) => {
        const { app_status, approval_status } = req.queryParams;

        const inventoryApps = schema.skInventoryApps
          .where(
            (a) =>
              a.app_status === Number(app_status) &&
              a.approval_status === Number(approval_status)
          )
          .models.map((a) => ({
            ...a.toJSON(),
            app_metadata: a.app_metadata,
          }));

        return {
          count: inventoryApps.length,
          next: null,
          previous: null,
          results: inventoryApps,
        };
      });

      await visit('/dashboard/storeknox/inventory/app-list');

      // Contains the right number of apps
      const appElementList = findAll(
        '[data-test-storeknoxInventory-appListTable-row]'
      );

      assert.strictEqual(appElementList.length, 1);

      // Sanity check for rendered apps
      const appMetadata = inventoryApp.app_metadata;

      const iAppElement = find(
        `[data-test-storeknoxInventory-appListTable-rowId='${inventoryApp.id}']`
      );

      // Confirm rendered app data
      await confirmRenderedAppData(assert, iAppElement, appMetadata, {
        icon_key,
        status_text,
        status_tooltip_info: tooltip,
      });
    }
  );

  /**
   *  ==============================
   *  Test: Filters by monitoring status
   *  ==============================
   */
  test.each(
    'it filters by monitoring status',
    [
      {
        key: () => t('disabled'),
        filterValue: MONITORING_STATUS_FILTERS.DISABLED,
        assertCount: 40,
      },
      {
        key: () => t('storeknox.beingInitialized'),
        filterValue: MONITORING_STATUS_FILTERS.INITIALIZING,
        assertCount: 40,
      },
      {
        key: () => t('storeknox.needsAction'),
        filterValue: MONITORING_STATUS_FILTERS.ACTION_NEEDED,
        assertCount: 42,
      },
      {
        key: () => t('storeknox.noActionNeeded'),
        filterValue: MONITORING_STATUS_FILTERS.NO_ACTION_NEEDED,
        assertCount: 42,
      },
      {
        key: () => t('all'),
        filterValue: MONITORING_STATUS_FILTERS.ALL,
        assertCount: 116,
      },
    ],
    async function (assert, { key, filterValue, assertCount }) {
      assert.expect(assertCount);

      // Create inventory apps with different monitoring statuses
      const appsToCreate = inventoryAppMonitoringStatusConfig.concat(
        inventoryAppMonitoringStatusConfig
      );

      const inventoryApps = appsToCreate.map(
        ({ store_monitoring_status, monitoring_enabled }) =>
          this.server.create('sk-inventory-app', 'withApprovedStatus', {
            store_monitoring_status,
            monitoring_enabled,
          })
      );

      const expectedFilterApps = inventoryApps.filter((a) =>
        filterAppsByMonitoringStatus(a, filterValue)
      );

      // Server mocks
      this.server.get('v2/sk_app', (schema, req) => {
        const { app_status, approval_status, monitoring_status } =
          req.queryParams;

        const filterValue = Number(monitoring_status ?? -1);

        const inventoryApps = schema.skInventoryApps
          .where(
            (a) =>
              a.app_status === Number(app_status) &&
              a.approval_status === Number(approval_status)
          )
          .filter((a) => filterAppsByMonitoringStatus(a, filterValue))
          .sort((a, b) => {
            const aStatus = a.store_monitoring_status;
            const bStatus = b.store_monitoring_status;

            // Sort map for monitoring statuses
            const sortMap = {
              [MONITORING_STATUSES.UNSCANNED]: 0,
              [MONITORING_STATUSES.PENDING]: 1,
              [MONITORING_STATUSES.SCANNED]: 2,
            };

            // Sort pending apps by monitoring enabled status
            if (
              aStatus === MONITORING_STATUSES.PENDING &&
              bStatus === MONITORING_STATUSES.PENDING
            ) {
              return a.monitoring_enabled ? -1 : 1;
            }

            // Sort other apps by monitoring status
            return (
              sortMap[a.store_monitoring_status] -
              sortMap[b.store_monitoring_status]
            );
          })
          .models.map((a) => ({ ...a.toJSON(), app_metadata: a.app_metadata }));

        return {
          count: inventoryApps.length,
          next: null,
          previous: null,
          results: inventoryApps,
        };
      });

      await visit('/dashboard/storeknox/inventory/app-list');

      const appElementList = findAll(
        '[data-test-storeknoxInventory-appListTable-row]'
      );

      assert.strictEqual(
        appElementList.length,
        inventoryApps.length,
        'Should render all apps without monitoring status filter'
      );

      // Available filter options
      const statusIconSelector =
        '[data-test-storeknoxinventory-appListTable-monitoringstatus-header-icon]';

      assert
        .dom(
          '[data-test-storeknoxinventory-appListTable-monitoringStatus-header-container]'
        )
        .exists();

      assert.dom(statusIconSelector).hasClass(/inherit/);

      assert
        .dom(
          '[data-test-storeknoxinventory-appListTable-monitoringStatus-header-text]'
        )
        .hasText(t('storeknox.monitoringStatus'));

      // Open monitoring status filter popover
      await openMonitoringStatusFilter(assert);

      // Filter options
      const filterOptionSelector = `[data-test-storeknoxInventory-appListTable-monitoringStatus-header-option='${key()}']`;
      const filterOptionRadioSelector = `[data-test-storeknoxInventory-appListTable-monitoringStatus-header-radio]`;
      const filterOptionTextSelector = `[data-test-storeknoxInventory-appListTable-monitoringStatus-header-option-text]`;

      let filterOption = find(filterOptionSelector);

      assert.dom(filterOption).exists();
      assert.dom(filterOptionTextSelector, filterOption).hasText(key());

      if (filterValue !== MONITORING_STATUS_FILTERS.ALL) {
        assert.dom(filterOptionRadioSelector, filterOption).isNotChecked();
      } else {
        assert.dom(filterOptionRadioSelector, filterOption).isChecked(); // All filter is checked by default
      }

      await click(filterOption);

      filterOption = find(filterOptionSelector);

      assert.dom(filterOption).doesNotExist();

      // Check if the filter icon color changes to primary when a filter is applied
      assert
        .dom(statusIconSelector)
        .hasClass(
          filterValue === MONITORING_STATUS_FILTERS.ALL ? /inherit/ : /primary/
        );

      // Sanity check for filtered apps
      const filteredAppElementList = findAll(
        '[data-test-storeknoxInventory-appListTable-row]'
      );

      assert.strictEqual(
        filteredAppElementList.length,
        expectedFilterApps.length,
        'Should render filtered apps'
      );

      // Check if the filtered apps are rendered
      for (const app of filteredAppElementList) {
        const appId = app.getAttribute(
          'data-test-storeknoxInventory-appListTable-rowId'
        );

        // Expected app should exist in the filtered apps
        const expectedApp = expectedFilterApps.find((a) => a.id === appId);

        assert.ok(expectedApp, `Ensure rendered app with id ${appId} is valid`);

        // Status info for the expected app
        const { icon_key, status_text, tooltip } = appsToCreate.find(
          (a) =>
            a.store_monitoring_status === expectedApp.store_monitoring_status &&
            a.monitoring_enabled === expectedApp.monitoring_enabled
        );

        await confirmRenderedAppData(assert, app, expectedApp.app_metadata, {
          icon_key,
          status_text,
          status_tooltip_info: tooltip,
        });
      }

      // Open monitoring status filter popover
      await openMonitoringStatusFilter(assert);

      // Check selected filter state
      filterOption = find(filterOptionSelector);

      assert.dom(filterOptionRadioSelector, filterOption).isChecked();
      assert.dom(filterOptionTextSelector, filterOption).hasText(key());
    }
  );
});
