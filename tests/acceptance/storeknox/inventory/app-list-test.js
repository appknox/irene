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

module('Acceptance | storeknox/inventory/app-list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
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

    this.server.get('/v2/sk_organization', (schema) => {
      const skOrganizations = schema.skOrganizations.all().models;

      return {
        count: skOrganizations.length,
        next: null,
        previous: null,
        results: skOrganizations,
      };
    });

    // Services
    this.owner.register('service:notifications', NotificationsStub);

    this.setProperties({ currentOrganizationMe });
  });

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

      const selectedSkOrg = this.server.create('sk-organization', {
        id: 4,
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
        assert.strictEqual(selectedSkOrg.id, req.params.id);

        // Toggle value is opposite of what is default
        assert.strictEqual(
          add_appknox_project_to_inventory_by_default,
          !selectedSkOrg.add_appknox_project_to_inventory_by_default
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

  test.each(
    'it renders with approved apps (With Action Required and No Action Required)',
    [
      {
        with_action_required: true,
        store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.UNSCANNED,
      },
      {
        with_action_required: false,
        store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.SCANNED,
      },
    ],
    async function (assert, { with_action_required, store_monitoring_status }) {
      const inventoryApps = this.server.createList(
        'sk-inventory-app',
        3,
        'withApprovedStatus',
        { store_monitoring_status }
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

      const appElementList = findAll(
        '[data-test-storeknoxInventory-appListTable-row]'
      );

      // Contains the right number of apps
      assert.strictEqual(appElementList.length, inventoryApps.length);

      // Sanity check for rendered apps
      for (let index = 0; index < inventoryApps.length; index++) {
        const iApp = inventoryApps[index];

        const iAppElement = find(
          `[data-test-storeknoxInventory-appListTable-rowId='${iApp.id}']`
        );

        const metadata = iApp.app_metadata;

        if (iApp.platform === ENUMS.PLATFORM.ANDROID) {
          assert
            .dom(
              '[data-test-storeknoxTableColumns-store-playStoreIcon]',
              iAppElement
            )
            .exists();
        }

        if (iApp.platform === ENUMS.PLATFORM.IOS) {
          assert
            .dom('[data-test-storeknoxTableColumns-store-iosIcon]', iAppElement)
            .exists();
        }

        assert
          .dom(
            '[data-test-storeknoxTableColumns-applicationDevName]',
            iAppElement
          )
          .hasText(metadata.dev_name);

        assert
          .dom(
            '[data-test-storeknoxTableColumns-applicationDevEmail]',
            iAppElement
          )
          .hasText(metadata.dev_email);

        assert
          .dom(
            '[data-test-storeknoxTableColumns-applicationTitle]',
            iAppElement
          )
          .hasText(metadata.title);

        assert
          .dom(
            '[data-test-storeknoxTableColumns-applicationPackageName]',
            iAppElement
          )
          .hasText(metadata.package_name);

        assert
          .dom('[data-test-applogo-img]', iAppElement)
          .hasAttribute('src', metadata.icon_url);

        assert
          .dom(
            '[data-test-storeknoxInventory-appListTable-monitoringStatusIcon]',
            iAppElement
          )
          .hasClass(with_action_required ? /error/ : /success/)
          .hasClass(with_action_required ? /info/ : /check-circle/);

        // Check for needs action tooltip
        const tooltipTrigger =
          '[data-test-storeknoxInventory-appListTable-monitoringStatusIcon]';

        const needsActionTooltipTriggerElement = find(tooltipTrigger);

        const tooltipContentSelector = '[data-test-ak-tooltip-content]';

        await triggerEvent(needsActionTooltipTriggerElement, 'mouseenter');

        assert.dom(tooltipContentSelector).exists();

        assert
          .dom(
            '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipHeaderText]'
          )
          .hasText(t('reason'));

        assert
          .dom(
            '[data-test-storeknoxInventory-appListTable-monitoringStatusTooltipText]'
          )
          .containsText(
            with_action_required
              ? t('storeknox.actionsNeededMsg')
              : t('storeknox.noActionsNeededMsg')
          )
          .containsText(t('storeknox.haveBeenDetected'));

        await triggerEvent(needsActionTooltipTriggerElement, 'mouseleave');
      }
    }
  );
});
