import {
  visit,
  find,
  click,
  waitFor,
  triggerEvent,
  waitUntil,
  currentURL,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

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

// Stub window service
class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }

  location = {
    href: ENV.host,

    replace: (url) => {
      this.url = url;
    },
  };

  removeEventListener = () => {};
  addEventListener = () => {};

  localStorage = {
    getItem: (key) => {
      return this[key];
    },

    setItem: (key, value) => {
      this[key] = value;
    },
  };

  sessionStorage = {
    getItem: (key) => {
      return this[key];
    },

    setItem: (key, value) => {
      this[key] = value;
    },
  };
}
/**
 * ===============================
 * TEST HELPERS
 * ===============================
 */

// Checks the result info in the latest va results section of an SkApp
const doVaResultsChecks = async (
  assert,
  coreProjectLatestVersion,
  file_risk_info
) => {
  assert
    .dom('[data-test-storeknoxInventoryDetails-latestVAResultsSummary]')
    .hasText(t('summary'));

  // Check VA Results Risk Summary
  const vaResultsRiskInfo = {
    critical: file_risk_info.risk_count_critical,
    high: file_risk_info.risk_count_high,
    medium: file_risk_info.risk_count_medium,
    low: file_risk_info.risk_count_low,
    passed: file_risk_info.risk_count_passed,
    untested: file_risk_info.risk_count_unknown,
  };

  const vaResultsRiskInfoCategories = Object.keys(vaResultsRiskInfo);

  for (const category of vaResultsRiskInfoCategories) {
    const resultCatElement = find(
      `[data-test-storeknoxInventoryDetails-latestVAResultsSummary='${category}']`
    );

    assert.dom(resultCatElement);

    assert
      .dom(
        '[data-test-storeknoxInventoryDetails-latestVAResultsSummary-categoryTitle]',
        resultCatElement
      )
      .hasText(t(category));

    await waitUntil(() =>
      resultCatElement?.querySelector(
        '[data-test-storeknoxInventoryDetails-latestVAResultsSummary-categoryResultCount]'
      )
    );

    assert
      .dom(
        '[data-test-storeknoxInventoryDetails-latestVAResultsSummary-categoryResultCount]',
        resultCatElement
      )
      .hasText(String(vaResultsRiskInfo[category]));
  }

  // File ID
  assert
    .dom('[data-test-storeknoxInventoryDetails-latestVAResultsFileId]')
    .hasText(t('fileID'));

  assert
    .dom('[data-test-storeknoxInventoryDetails-latestVAResultsFileIdLink]')
    .hasText(coreProjectLatestVersion.id);

  // Other VA Results data
  const vaResultsData = [
    {
      title: t('version'),
      value: coreProjectLatestVersion?.get('version'),
    },
    {
      title: t('versionCodeTitleCase'),
      value: coreProjectLatestVersion?.get('versionCode'),
    },
    {
      title: t('storeknox.lastScannedDate'),
      value: dayjs(coreProjectLatestVersion?.get('createdOn')).format(
        'DD MMM YYYY'
      ),
    },
  ];

  vaResultsData.forEach((info) => {
    const resultCatElement = find(
      `[data-test-storeknoxInventoryDetails-latestVAResultsInfo='${info.title}']`
    );

    assert.dom(resultCatElement);

    assert
      .dom(
        '[data-test-storeknoxInventoryDetails-latestVAResultsInfoTitle]',
        resultCatElement
      )
      .hasText(info.title);

    assert
      .dom(
        '[data-test-storeknoxInventoryDetails-latestVAResultsInfoValue]',
        resultCatElement
      )
      .hasText(info.value);
  });
};

// Check for monitoring results pending info
const assertMonitoringDisabledInfo = async (assert) => {
  const monitoringOffIllustration =
    '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]';

  await waitFor(monitoringOffIllustration);

  assert.dom(monitoringOffIllustration).exists();

  assert
    .dom(
      '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsHeaderText]'
    )
    .hasText(t('storeknox.enableMonitoringForApp'));

  assert
    .dom(
      '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsOff]'
    )
    .hasText(t('storeknox.monitoringDisabledWithNoResults'));
};

const assertMonitoringPendingInfoWithMonitoringOff = async (assert) => {
  // Check for monitoring results pending info when monitoring status is off
  const monitoringOnIllustration =
    '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]';

  await waitFor(monitoringOnIllustration);

  assert.dom(monitoringOnIllustration).exists();

  assert
    .dom('[data-test-storeknoxInventoryDetails-monitoringResultsPendingText]')
    .hasText(t('storeknox.monitoringResultsPending'));
};

const STATUS_TOGGLE =
  '[data-test-storeknoxInventoryDetails-monitoringStatusToggle] [data-test-toggle-input]';

// Creates the inventoryApp + server mocks required by every monitoring toggle test.
// Returns { inventoryApp }.
const setupMonitoringToggle = (
  context,
  {
    turn_on,
    sk_app_has_license,
    is_member = false,
    is_trial = false,
    org_sub_licenses_remaining = 0,
    with_expired_license = false,
    fail = false,
    errMessage = 'failed to update monitoring status',
  }
) => {
  const turnOff = !turn_on;
  const now = dayjs();

  context.currentOrganizationMe.update(
    is_member
      ? { is_owner: false, is_admin: false }
      : { is_owner: true, is_admin: true }
  );

  context.currentSkOrganizationSub.update({
    is_trial,
    licenses_remaining: org_sub_licenses_remaining,
    end_date: with_expired_license
      ? now.subtract(1, 'd').toDate()
      : now.add(1, 'd').toDate(),
  });

  const inventoryApp = context.server.create(
    'sk-inventory-app',
    'withApprovedStatus',
    {
      monitoring_enabled: turnOff,
      license_allocated: sk_app_has_license ? 1 : 0,
      store_monitoring_status: turnOff
        ? ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING
        : ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
      fake_app_detection_status: turnOff
        ? ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING
        : ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
    }
  );

  context.server.get('/v2/sk_organization/:id/sk_subscription', (schema, req) =>
    schema.skOrganizationSubs.find(req.params.id).toJSON()
  );

  context.server.put(
    '/v2/sk_app/:id/update_monitoring_enabled_status',
    (schema, req) => {
      if (fail) {
        return new Response(501, {}, { detail: errMessage });
      }

      const { monitoring_enabled } = JSON.parse(req.requestBody);

      const app = schema.skInventoryApps.find(req.params.id).update({
        monitoring_enabled,
        store_monitoring_status: turnOff
          ? ENUMS.SK_APP_MONITORING_STATUS.DISABLED
          : ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
        fake_app_detection_status: turnOff
          ? ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED
          : ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
      });

      return {
        ...app.toJSON(),
        app_metadata: app.app_metadata,
        monitoring_enabled,
      };
    }
  );

  return { inventoryApp };
};

// Asserts the toggle is OFF and the "monitoring disabled" empty state is shown.
const assertMonitoringToggleOff = async (assert) => {
  assert.dom(STATUS_TOGGLE).isNotChecked();
  await assertMonitoringDisabledInfo(assert);
};

// Asserts the toggle is ON and the "results pending" empty state is shown.
const assertMonitoringToggleOn = async (assert) => {
  assert.dom(STATUS_TOGGLE).isChecked();
  await assertMonitoringPendingInfoWithMonitoringOff(assert);
};

/**
 * ===============================
 * TEST STARTING POINT
 * ===============================
 */

module(
  'Acceptance | storeknox/inventory-details/app-details',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const {
        organization,
        currentOrganizationMe,
        currentOrganizationMember,
        currentSkOrganization,
        currentSkOrganizationSub,
      } = await setupRequiredEndpoints(this.server);

      const { file_risk_info } = setupFileModelEndpoints(this.server);

      organization.update({ features: { storeknox: true } });

      // Stub organization me service
      class OrganizationMeStub extends Service {
        org = currentOrganizationMe;

        async getMembership() {
          return currentOrganizationMember;
        }
      }

      this.owner.register('service:me', OrganizationMeStub);

      // Server mocks
      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      this.server.get(
        '/v2/sk_organization/:id/sk_subscription',
        (schema, req) => {
          return {
            id: req.params.id,
            is_active: true,
            is_trial: false,
          };
        }
      );

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      // Services
      this.owner.register('service:notifications', NotificationsStub);
      const store = this.owner.lookup('service:store');

      const normalizeSKInventoryApp = (inventoryApp) =>
        store.push(
          store.normalize('sk-inventory-app', {
            ...inventoryApp.toJSON(),
            app_metadata: inventoryApp.app_metadata,
          })
        );

      // Creates an archived app
      const createArchivedApp = (propertyOverrides = {}) => {
        return this.server.create('sk-inventory-app', 'withArchivedStatus', {
          archived_on: dayjs().subtract(6, 'months').toDate(),
          unarchive_available_on: dayjs().subtract(5, 'months').toDate(),
          ...propertyOverrides,
        });
      };

      this.setProperties({
        currentOrganizationMe,
        store,
        normalizeSKInventoryApp,
        createArchivedApp,
        currentSkOrganization,
        currentSkOrganizationSub,
        file_risk_info,
      });
    });

    /**
     * ===============================
     * Renders header and app details sections
     * ===============================
     */

    test.each(
      'it renders header and app details sections',
      [
        { available_on_appknox: true },
        { available_on_appknox: false },
        { has_license: true },
      ],
      async function (assert, { available_on_appknox, has_license }) {
        const file = this.server.create('file');
        const core_project = this.server.create('project');

        // Models
        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          {
            core_project: available_on_appknox ? core_project.id : null,
            core_project_latest_version: available_on_appknox ? file.id : null,
            license_allocated: has_license ? 1 : 0,
          }
        );

        const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
        );

        assert
          .dom('[data-test-storeknoxInventoryDetails-breadcrumbContainer]')
          .exists();

        if (!available_on_appknox) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-appNotPartOfAppknoxIcon]'
            )
            .exists();

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-appNotPartOfAppknoxIconText]'
            )
            .hasText(t('storeknox.appNotPartOfAppknox'));
        }

        assert
          .dom('[data-test-storeknoxInventoryDetails-appLogoImage]')
          .hasAttribute('src', inventoryAppRecord.appMetadata.iconUrl);

        assert
          .dom('[data-test-storeknoxInventoryDetails-headerAppTitle]')
          .hasText(inventoryAppRecord.appMetadata.title);

        assert
          .dom('[data-test-storeknoxInventoryDetails-headerAppPackageName]')
          .hasText(inventoryAppRecord.appMetadata.packageName);

        // App Logo tests
        assert
          .dom('[data-test-storeknoxInventoryDetails-headerPlatformIcon]')
          .hasClass(inventoryAppRecord.isAndroid ? /android/ : /apple/);

        const storeLogoSelector = inventoryAppRecord.isAndroid
          ? '[data-test-storeknoxInventoryDetails-playStoreLogo]'
          : '[data-test-storeknoxInventoryDetails-appStoreLogo]';

        assert.dom(storeLogoSelector).exists();

        // Page Info tag

        const licenseAllocatedIcon =
          '[data-test-storeknoxInventoryDetails-licenseAllocatedIcon]';

        if (has_license) {
          assert.dom(licenseAllocatedIcon).exists();
        } else {
          assert.dom(licenseAllocatedIcon).doesNotExist();
        }

        assert
          .dom('[data-test-storeknoxInventoryDetails-pageInfoTag]')
          .doesNotExist();

        assert
          .dom('[data-test-storeknoxInventoryDetails-monitoringStatusToggle]')
          .exists();

        assert
          .dom('[data-test-storeknoxInventoryDetails-monitoringStatusInfoText]')
          .hasText(t('storeknox.monitoringAction'));

        // App info
        assert
          .dom('[data-test-storeknoxInventoryDetails-appDetailsHeaderText]')
          .hasText(t('storeknox.appDetails'));

        const appDetailsInfo = [
          {
            id: 'developer',
            title: t('storeknox.developer'),
            value: inventoryAppRecord.devName,
          },
          {
            id: 'email-id',
            title: t('emailId'),
            value: inventoryAppRecord.devEmail,
          },
          {
            id: 'date-added',
            title: t('storeknox.addedToInventoryOn'),
            value: dayjs(inventoryAppRecord.addedOn).format('DD, MMM YYYY'),
          },
        ];

        appDetailsInfo.forEach((info) => {
          const infoElement = find(
            `[data-test-storeknoxInventoryDetails-appDetailsHeader='${info.id}']`
          );

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-appDetailsHeaderInfoText]',
              infoElement
            )
            .hasText(info.title);

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-appDetailsHeaderInfoValue]',
              infoElement
            )
            .hasText(info.value || '-');
        });
      }
    );

    /**
     * =============================================
     * MEMBERS CANNOT TOGGLE
     * =============================================
     */
    test.each(
      'members cannot toggle monitoring status',
      [{ turn_on: true }, { turn_on: false }],
      async function (assert, { turn_on }) {
        const { inventoryApp } = setupMonitoringToggle(this, {
          turn_on,
          sk_app_has_license: true,
          is_member: true,
        });

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}`
        );

        if (turn_on) {
          assert.dom(STATUS_TOGGLE).isNotChecked().isDisabled();
        } else {
          assert.dom(STATUS_TOGGLE).isChecked().isDisabled();
        }

        const tooltip = find(
          '[data-test-storeknoxInventoryDetails-monitoringStatusToggleTooltip]'
        );

        await triggerEvent(tooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .containsText(t('storeknox.cannotPerformStatusToggleText'));

        await triggerEvent(tooltip, 'mouseleave');
      }
    );

    /**
     * =============================================
     * TOGGLE SUCCESS (with license — no drawer)
     * =============================================
     */
    test.each(
      'it toggles monitoring status successfully when app has a license',
      [{ turn_on: true }, { turn_on: false }],
      async function (assert, { turn_on }) {
        const { inventoryApp } = setupMonitoringToggle(this, {
          turn_on,
          sk_app_has_license: true,
        });

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}`
        );

        // Assert initial state
        if (turn_on) {
          await assertMonitoringToggleOff(assert);
        } else {
          await assertMonitoringToggleOn(assert);
        }

        await click(STATUS_TOGGLE);

        // Assert inverted state
        if (turn_on) {
          await assertMonitoringToggleOn(assert);
        } else {
          await assertMonitoringToggleOff(assert);
        }
      }
    );

    /**
     * =============================================
     * TOGGLE FAILURE — shows error notification
     * =============================================
     */
    test.each(
      'it retains monitoring state and shows an error notification when toggle fails',
      [
        { turn_on: true, sk_app_has_license: true },
        { turn_on: false, sk_app_has_license: true },
      ],
      async function (assert, { turn_on, sk_app_has_license }) {
        const errMessage = 'failed to update monitoring status';

        const { inventoryApp } = setupMonitoringToggle(this, {
          turn_on,
          sk_app_has_license,
          fail: true,
          errMessage,
        });

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}`
        );

        await click(STATUS_TOGGLE);

        // State must be unchanged
        if (turn_on) {
          await assertMonitoringToggleOff(assert);
        } else {
          await assertMonitoringToggleOn(assert);
        }

        const notifService = this.owner.lookup('service:notifications');
        assert.strictEqual(notifService.errorMsg, errMessage);
      }
    );

    /**
     * =============================================
     * LICENSE ALLOCATION DRAWER
     * Shown only when: turn_on + no license + not trial + sub not expired
     * =============================================
     */
    test.each(
      'it shows the license allocation drawer when turning on without a license',
      [
        // Has available licenses → confirm allocates one
        { org_sub_licenses_remaining: 1 },
        // No licenses available → confirm redirects to contact support
        { org_sub_licenses_remaining: 0 },
      ],
      async function (assert, { org_sub_licenses_remaining }) {
        const availableLicenses = org_sub_licenses_remaining;
        const noLicensesAvailable = availableLicenses === 0;

        const { inventoryApp } = setupMonitoringToggle(this, {
          turn_on: true,
          sk_app_has_license: false,
          is_trial: false,
          org_sub_licenses_remaining,
        });

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}`
        );
        await assertMonitoringToggleOff(assert);

        await click(STATUS_TOGGLE);

        assert
          .dom('[data-test-storeknoxInventoryDetails-toggleMonitoringDrawer]')
          .exists();

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerHeading]'
          )
          .hasText(t('confirmation'));

        const { message, confirmButtonText, cancelButtonText } =
          noLicensesAvailable
            ? {
                message: t('storeknox.noLicensesAvailable', {
                  htmlSafe: true,
                  availableLicenses,
                }),
                confirmButtonText: t('contactSupport'),
                cancelButtonText: t('close'),
              }
            : {
                message: t('storeknox.licenseAllocationNote', {
                  htmlSafe: true,
                  availableLicenses,
                }),
                confirmButtonText: `${t('yes')}, ${t('turnOn')}`,
                cancelButtonText: t('cancel'),
              };

        compareInnerHTMLWithIntlTranslation(assert, {
          selector:
            '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerMessage]',
          message,
          doIncludesCheck: true,
        });

        compareInnerHTMLWithIntlTranslation(assert, {
          selector:
            '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerConfirmBtn]',
          message: confirmButtonText,
          doIncludesCheck: true,
        });

        compareInnerHTMLWithIntlTranslation(assert, {
          selector:
            '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerCancelBtn]',
          message: cancelButtonText,
          doIncludesCheck: true,
        });

        // Confirm — in the "has licenses" case, toggle should complete
        if (!noLicensesAvailable) {
          await click(
            '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerConfirmBtn]'
          );
          await assertMonitoringToggleOn(assert);
        }
      }
    );

    /**
     * =============================================
     * TRIAL ORG — no drawer, toggles freely
     * =============================================
     */
    test.each(
      'trial org can toggle monitoring without the license drawer',
      [{ turn_on: true }, { turn_on: false }],
      async function (assert, { turn_on }) {
        const { inventoryApp } = setupMonitoringToggle(this, {
          turn_on,
          sk_app_has_license: false,
          is_trial: true,
        });

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}`
        );

        await click(STATUS_TOGGLE);

        // Drawer must not appear
        assert
          .dom('[data-test-storeknoxInventoryDetails-toggleMonitoringDrawer]')
          .doesNotExist();

        // Toggle should have flipped
        if (turn_on) {
          await assertMonitoringToggleOn(assert);
        } else {
          await assertMonitoringToggleOff(assert);
        }
      }
    );

    /**
     * =============================================
     * EXPIRED SUBSCRIPTION — no drawer regardless of license state
     * =============================================
     */
    test.each(
      'expired subscription skips the license drawer',
      [
        { turn_on: true, sk_app_has_license: false },
        { turn_on: false, sk_app_has_license: true },
      ],
      async function (assert, { turn_on, sk_app_has_license }) {
        const { inventoryApp } = setupMonitoringToggle(this, {
          turn_on,
          sk_app_has_license,
          with_expired_license: true,
        });

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}`
        );

        await click(STATUS_TOGGLE);

        assert
          .dom('[data-test-storeknoxInventoryDetails-toggleMonitoringDrawer]')
          .doesNotExist();
      }
    );

    /**
     * ===============================
     * Contact support flow for when storeknox credits are exhausted
     * ===============================
     */
    test('contact support flow for when storeknox credits are exhausted', async function (assert) {
      assert.expect(9);

      // Same flow for owners and admins
      // Unavailable for members
      this.currentOrganizationMe.update({ is_owner: true });

      this.currentSkOrganizationSub.update({
        licenses_remaining: 0,
        end_date: dayjs(new Date()).add(1, 'd').toDate(),
        is_trial: false, // Owners of trial orgs can toggle at will and have no restrictions
      });

      this.owner.register('service:browser/window', WindowStub);

      // Models
      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          monitoring_enabled: false,
          license_allocated: 0,

          // Required to test the pending state illustration and text
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
        }
      );

      // Server mocks
      this.server.get(
        '/v2/sk_organization/:id/sk_subscription',
        (schema, req) => {
          return schema.skOrganizationSubs.find(req.params.id).toJSON();
        }
      );

      this.server.post(
        '/v2/feature_request/sk_credit',
        () => new Response(204)
      );

      await visit(`/dashboard/storeknox/inventory-details/${inventoryApp.id}`);

      assert
        .dom('[data-test-storeknoxInventoryDetails-breadcrumbContainer]')
        .exists();

      const statusToggleSelector =
        '[data-test-storeknoxInventoryDetails-monitoringStatusToggle] [data-test-toggle-input]';

      assert.dom(statusToggleSelector).isNotChecked();

      await click(statusToggleSelector);

      // Should show no licenses available message
      compareInnerHTMLWithIntlTranslation(assert, {
        selector:
          '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerMessage]',

        message: t('storeknox.noLicensesAvailable', {
          htmlSafe: true,
          availableLicenses: this.currentSkOrganizationSub.licenses_remaining,
        }),

        doIncludesCheck: true,
      });

      const confirmButtonSelector =
        '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerConfirmBtn]';

      const cancelButtonSelector =
        '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerCancelBtn]';

      assert.dom(confirmButtonSelector).hasText(t('contactSupport'));
      assert.dom(cancelButtonSelector).hasText(t('close'));

      await click(confirmButtonSelector);

      // Should show credit request success message
      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerSuccessIllustration]'
        )
        .exists();

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-toggleMonitoringDrawerSuccessMessage]'
        )
        .hasText(t('storeknox.creditRequestSuccess'));

      await click(cancelButtonSelector);

      assert.dom(statusToggleSelector).isNotChecked();

      // Check request is stored in local storage
      const windowStub = this.owner.lookup('service:browser/window');

      assert.strictEqual(
        windowStub.localStorage.getItem('storeknox_credit_request'),
        'true'
      );
    });

    /**
     * ===============================
     * Renders VA results if core project latest version exists
     * ===============================
     */
    test('it renders VA results if core project latest version exists', async function (assert) {
      assert.expect(22);

      // Models
      const vulnerabilities = this.server.createList('vulnerability', 7);

      const analyses = vulnerabilities.map((v) =>
        this.server.create('analysis', { vulnerability: v.id }).toJSON()
      );

      const file = this.server.create('file');
      const core_project = this.server.create('project');

      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          core_project: core_project.id,
          core_project_latest_version: file.id,
        }
      );

      const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

      // Server mocks
      this.server.get('/v3/files/:id', (schema, req) => {
        return {
          ...schema.files.find(`${req.params.id}`)?.toJSON(),
          analyses,
        };
      });

      await visit(
        `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
      );

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-latestVAResultsHeaderInfoValue]'
        )
        .hasText(t('storeknox.latestVAResults'));

      await doVaResultsChecks(
        assert,
        inventoryAppRecord.get('coreProjectLatestVersion'),
        this.file_risk_info
      );
    });

    /**
     * ===============================
     * Renders a "no access state" in latest VA Results when user does not have access to file
     * ===============================
     */
    test('it renders a "no access state" in latest VA Results when user does not have access to file', async function (assert) {
      // Models
      const file = this.server.create('file');
      const core_project = this.server.create('project');

      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          core_project: core_project.id,
          core_project_latest_version: file.id,
        }
      );

      // Server mocks
      this.server.get('/v3/files/:id', () => new Response(404), 404);

      // Test Start
      await visit(`/dashboard/storeknox/inventory-details/${inventoryApp.id}`);

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-latestVAResultsHeaderInfoValue]'
        )
        .hasText(t('storeknox.latestVAResults'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-vaFileNotAccessibleIllustration]'
        )
        .exists();

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-vaFileNotAccessibleHeaderText]'
        )
        .hasText(t('storeknox.noAcessToVAResultsHeaderText'));

      assert
        .dom('[data-test-storeknoxInventoryDetails-vaFileNotAccessibleSubText]')
        .hasText(t('storeknox.noAcessToVAResultsSubtext'));
    });

    /**
     * ===============================
     * Renders the different initiate upload states
     * ===============================
     */
    test.each(
      'it renders the different initiate upload states',
      [
        // SCENARIO 1: When upload has not been initiated
        {
          canInitiateUpload: true,
          canAccessSubmission: true,
          hasSubmission: false,
        },
        // When upload is in progress
        // SCENARIO 2: For initiator who has submission access
        {
          canInitiateUpload: false,
          canAccessSubmission: true,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.STORE_VALIDATING_URL,
          uploadInProgress: true,
        },

        // SCENARIO 3: For non-initiator who cannot access submission
        {
          canInitiateUpload: false,
          canAccessSubmission: false,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.STORE_UPLOADING,
          uploadInProgress: true,
          isOwner: false,
        },

        // SCENARIO 4: For non-initiator who cannot access submission and is owner
        {
          canInitiateUpload: false,
          canAccessSubmission: false,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.STORE_UPLOADING,
          uploadInProgress: true,
          isOwner: true,
        },

        // When upload fails
        // SCENARIO 5: For initiator who has submission access
        {
          canInitiateUpload: true,
          canAccessSubmission: true,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
          subError: 'Upload has failed without reason',
          uploadFailed: true,
        },

        // SCENARIO 6: For non-initiator who cannot access submission
        {
          canInitiateUpload: true,
          canAccessSubmission: false,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
          uploadFailed: true,
        },

        // When upload is analyzing but sk_app does not have latest file yet
        // SCENARIO 7: For initiator who can access submission
        {
          canInitiateUpload: false,
          canAccessSubmission: true,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.ANALYZING,
          uploadInProgress: false,
        },

        // Disabled upload button if app is archived
        // SCENARIO 8: For initiator who can access submission
        {
          canInitiateUpload: true,
          canAccessSubmission: true,
          hasSubmission: false,
          isArchived: true,
        },
      ],
      async function (
        assert,
        {
          canInitiateUpload,
          hasSubmission,
          canAccessSubmission,
          subError,
          subStatus,
          isOwner,
          uploadFailed,
          uploadInProgress,
          isArchived,
        }
      ) {
        // Update org props
        this.currentOrganizationMe.update({
          is_owner: isOwner,
        });

        // Models
        const submission = this.server.create('submission', {
          reason: subError ?? '',
          status: subStatus ?? ENUMS.SUBMISSION_STATUS.VALIDATING,
        });

        const submissionRecord = canAccessSubmission
          ? this.store.push(
              this.store.normalize('submission', submission.toJSON())
            )
          : null;

        const inventoryApp = this.server.create(
          'sk-inventory-app',
          isArchived ? 'withArchivedStatus' : 'withApprovedStatus',
          {
            availability: { appknox: false, storeknox: true },
            can_initiate_upload: canInitiateUpload,
            upload_submission: hasSubmission ? submission.id : null,
            core_project: null,
            core_project_latest_version: null,
          }
        );

        const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

        // Server Mocks
        if (canAccessSubmission) {
          this.server.get('/submissions/:id', (schema, req) => {
            return {
              ...schema.submissions.find(`${req.params.id}`)?.toJSON(),
              reason: subError,
            };
          });
        } else {
          this.server.get('/submissions/:id', () => new Response(404), 404);
        }

        // Test Start
        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
        );

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-latestVAResultsHeaderInfoValue]'
          )
          .hasText(t('storeknox.latestVAResults'));

        // SCENARIO 1: Upload has not been initiated for all user roles
        const scenario_1 = !hasSubmission && canInitiateUpload;

        // SCENARIO 6: When Upload fails and current user is not the initiator for all user roles
        const scenario_6 =
          !canAccessSubmission &&
          uploadFailed &&
          hasSubmission &&
          canInitiateUpload;

        if (scenario_1 || scenario_6) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadIllustration]'
            )
            .exists();

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderMsg]'
            )
            .hasText(t('storeknox.appNotInAppknoxHeader'));

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderSubtext]'
            )
            .hasText(t('storeknox.appNotInAppknoxDescription'));

          assert
            .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
            .hasText(t('storeknox.initiateUpload'));
        }

        // SCENARIO 2: When Upload is in progress and current user is the initiator
        if (
          uploadInProgress &&
          !canInitiateUpload &&
          canAccessSubmission &&
          hasSubmission
        ) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetailsAppDetails-vaResults-uploadProgressIllustration]'
            )
            .exists();

          assert
            .dom(
              '[data-test-storeknoxInventoryDetailsAppDetails-vaResults-uploadProgressInfo]'
            )
            .containsText(t('processing'))
            .containsText(submissionRecord.progress);

          assert
            .dom(
              `[data-test-ak-loader-linear-progress='${submissionRecord.progress}']`
            )
            .exists();
        }

        // SCENARIO 3: When Upload is in progress and current user is not the initiator
        if (!canInitiateUpload && !canAccessSubmission && hasSubmission) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadIllustration]'
            )
            .exists();

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderMsg]'
            )
            .hasText(
              t(
                isOwner
                  ? 'storeknox.initiateUploadMessages.uploadPendingCompletion'
                  : 'storeknox.initiateUploadMessages.uploadInitiatedHeader'
              )
            );

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderSubtext]'
            )
            .hasText(t('storeknox.initiateUploadMessages.uploadInitiatedDesc'));

          assert
            .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
            .doesNotExist();

          // SCENARIO 4: When Upload is in progress and current user is not the initiator but an owner
          if (isOwner) {
            assert
              .dom(
                '[data-test-storeknoxInventoryDetails-viewNamespacesLinkOpenInNewIcon]'
              )
              .exists();

            assert
              .dom('[data-test-storeknoxInventoryDetails-viewNamespacesLink]')
              .hasText(t('notificationModule.viewNamespaces'));
          }
        }

        // SCENARIO 5: When Upload fails and current user is the initiator
        if (
          uploadFailed &&
          canAccessSubmission &&
          hasSubmission &&
          canInitiateUpload
        ) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-failedUploadIllustration]'
            )
            .exists();

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderMsg]'
            )
            .hasText(t('storeknox.initiateUploadMessages.uploadFailed'));

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderSubtext]'
            )
            .hasText(submissionRecord.reason);

          assert
            .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
            .hasText(t('storeknox.retryUpload'));
        }

        // When upload is analyzing but sk_app does not have latest file yet
        // SCENARIO 7: For initiator who can access submission
        if (
          !uploadInProgress &&
          !canInitiateUpload &&
          canAccessSubmission &&
          hasSubmission
        ) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-UploadCompletedIllustration]'
            )
            .exists();

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderMsg]'
            )
            .hasText(t('storeknox.initiateUploadMessages.uploadCompleted'));

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-initiateUploadHeaderSubtext]'
            )
            .hasText(
              t('storeknox.initiateUploadMessages.fileBeingAnalyzedMsg')
            );

          assert
            .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
            .doesNotExist();
        }

        // SCENARIO 8: Disabled upload button if app is archived
        if (isArchived) {
          // Assert the archived banner is shown
          assert.dom('[data-test-storeknoxInventoryDetails-banner]').exists();

          assert
            .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
            .isDisabled();

          // Assert tooltip content
          const uploadBtnIcon = find(
            '[data-test-storeknoxInventoryDetails-initiateUploadBtnIcon]'
          );

          await triggerEvent(uploadBtnIcon, 'mouseenter');

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUploadBtn-tooltipContent]'
            )
            .containsText(t('storeknox.cannotUploadForArchivedApps'));

          await triggerEvent(uploadBtnIcon, 'mouseleave');
        }
      }
    );

    /**
     * ===============================
     * Initiates app upload
     * ===============================
     */
    test('it initiates app upload', async function (assert) {
      assert.expect(25);

      // Models
      const file = this.server.create('file');
      const core_project = this.server.create('project');

      const submission = this.server.create('submission', {
        status: ENUMS.SUBMISSION_STATUS.ANALYZING,
      });

      this.store.push(this.store.normalize('submission', submission.toJSON()));

      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          can_initiate_upload: true,
          availability: { appknox: false, storeknox: true },
          upload_submission: null,
          core_project: null,
          core_project_latest_version: null,

          // App upload is only available to ANDROID APPS
          // TODO: Update for iOS apps when available
          app_metadata: this.server.create('sk-app-metadata', {
            platform: ENUMS.PLATFORM.ANDROID,
          }),
        }
      );

      const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

      // Server Mocks
      this.server.post('/v2/sk_app/:id/sk_app_upload', () => {
        this.set('uploadInitiated', true);

        this.server.db.skInventoryApps.update(inventoryApp.id, {
          can_initiate_upload: false,
        });

        return {
          id: submission.id,
          status: submission.status,
          url: '',
        };
      });

      // Server mocks
      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        if (this.uploadInitiated) {
          // Modify skApp props to completed state after upload is initiated
          this.server.db.skInventoryApps.update(req.params.id, {
            availability: { appknox: true, storeknox: true },
            can_initiate_upload: false,
            core_project: core_project.id,
            core_project_latest_version: file.id,
            upload_submission: null,
          });
        }

        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      this.server.get('/submissions/:id', (schema, req) => {
        return schema.submissions.find(`${req.params.id}`)?.toJSON();
      });

      // Test Start
      await visit(
        `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-initiateUploadIllustration]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-initiateUploadHeaderMsg]')
        .hasText(t('storeknox.appNotInAppknoxHeader'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-initiateUploadHeaderSubtext]'
        )
        .hasText(t('storeknox.appNotInAppknoxDescription'));

      assert
        .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
        .hasText(t('storeknox.initiateUpload'));

      await click('[data-test-storeknoxInventoryDetails-initiateUploadBtn]');

      // Indicates that app upload has been completed
      await waitFor(
        '[data-test-storeknoxInventoryDetails-latestVAResultsSummary]',
        { timeout: 1500 }
      );

      await doVaResultsChecks(
        assert,
        inventoryAppRecord.get('coreProjectLatestVersion'),
        this.file_risk_info
      );
    });

    // Checks the action btn props
    const assertActionBtnFeatures = (assert, action, actionElement) => {
      assert.dom(actionElement).hasText(action.label);

      if (action.featureInProgress) {
        assert.dom(actionElement).hasClass(/feature-in-progress/);
      } else {
        assert.dom(actionElement).doesNotHaveClass(/feature-in-progress/);
      }

      if (action.showDisabledState) {
        assert.dom(actionElement).hasClass(/disabled-state/);
      } else {
        assert.dom(actionElement).doesNotHaveClass(/disabled-state/);
      }

      if (action.needsAction) {
        assert.dom(actionElement).hasClass(/needs-action/);
      } else {
        assert.dom(actionElement).doesNotHaveClass(/needs-action/);
      }

      if (action.statusIsInitializing) {
        assert.dom(actionElement).hasClass(/status-initializing/);
      } else {
        assert.dom(actionElement).doesNotHaveClass(/status-initializing/);
      }

      if (action.featureInProgress) {
        assert.dom(actionElement).hasClass(/feature-in-progress/);
      } else {
        assert.dom(actionElement).doesNotHaveClass(/feature-in-progress/);
      }

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-actionBtn-leftIcon]',
          actionElement
        )
        .hasAttribute('icon', 'material-symbols:info');
    };

    /**
     * ===============================
     * Renders the actions list section
     * ===============================
     */
    test.each(
      'test: actions list section',
      ['malware-detected', 'unscanned-version', 'brand-abuse'].reduce(
        (opt, actionRoute) =>
          opt.concat([
            // Monitoring Statuses
            {
              store_monitoring_status:
                ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
              actionRoute,
            },
            {
              store_monitoring_status:
                ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
              actionRoute,
            },
            {
              store_monitoring_status:
                ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
              actionRoute,
            },
            {
              store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
              actionRoute,
            },

            // Fake App Detection Statuses
            {
              fake_app_detection_status:
                ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
              actionRoute,
            },
            {
              fake_app_detection_status:
                ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
              actionRoute,
            },
            {
              fake_app_detection_status:
                ENUMS.SK_FAKE_APP_DETECTION_STATUS.HAS_RESULTS,
              actionRoute,
            },
            {
              fake_app_detection_status:
                ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
              actionRoute,
            },
          ]),
        []
      ),
      async function (
        assert,
        { store_monitoring_status, actionRoute, fake_app_detection_status }
      ) {
        // Models
        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          {
            monitoring_enabled: true,
            store_monitoring_status,
            fake_app_detection_status,
          }
        );

        const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

        // Test Start
        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
        );

        // Current Actions list
        const actionsList = [
          {
            id: 'unscanned-version',
            label: t('storeknox.unscannedVersion'),
            hideAction: false,
            needsAction: inventoryAppRecord.storeMonitoringStatusIsActionNeeded,
            showDisabledState: !inventoryAppRecord.monitoringEnabled,
            disableActionButton:
              inventoryAppRecord.storeMonitoringPendingOrDisabled,

            statusIsInitializing:
              inventoryAppRecord.storeMonitoringStatusIsPending,
          },
          {
            id: 'brand-abuse',
            label: t('storeknox.fakeAppsTitle'),
            hideAction: false,
            models: [inventoryAppRecord.id],
            needsAction: inventoryAppRecord.fakeAppDetectionHasResults,
            showDisabledState: !inventoryAppRecord.monitoringEnabled,

            disableActionButton:
              inventoryAppRecord.fakeAppDetectionIsInitializing,

            statusIsInitializing:
              inventoryAppRecord.fakeAppDetectionIsInitializing,
          },
          {
            id: 'malware-detected',
            label: t('storeknox.malwareDetected'),
            featureInProgress: true,
          },
        ];

        // No. of items requiring action
        const needsActionCount = actionsList.reduce(
          (count, action) =>
            action.needsAction && !action.showDisabledState ? count + 1 : count,
          0
        );

        // Actions List Assertions
        assert
          .dom('[data-test-storeknoxInventoryDetails-actionListHeaderIcon]')
          .exists();

        assert
          .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
          .containsText(t('storeknox.actionNeeded'))
          .containsText(needsActionCount ? String(needsActionCount) : '');

        actionsList.forEach((action) => {
          const actionElement = find(
            `[data-test-storeknoxInventoryDetails-actionBtn='${action.id}']`
          );

          assertActionBtnFeatures(assert, action, actionElement);

          if (action.statusIsInitializing && !action.showDisabledState) {
            assert
              .dom(
                '[data-test-storeknoxInventoryDetails-actionBtn-rightIconLoader]',
                actionElement
              )
              .exists();
          } else {
            assert
              .dom(
                '[data-test-storeknoxInventoryDetails-actionBtn-rightIcon]',
                actionElement
              )
              .hasAttribute('icon', 'material-symbols:arrow-outward');
          }
        });

        // Check if the respective page info tag have the same status as in the actions list
        const actionBtnToClick = actionsList.find((a) => a.id === actionRoute);
        const isBrandAbuseActionBtn = actionBtnToClick.id === 'brand-abuse';

        const isMalwareDetectedActionBtn =
          actionBtnToClick.id === 'malware-detected';

        const canVisitMalwareDetectedPage =
          !inventoryAppRecord.appMonitoringIsInDisabledState;

        if (
          (!isBrandAbuseActionBtn && !actionBtnToClick.disableActionButton) ||
          (isMalwareDetectedActionBtn && canVisitMalwareDetectedPage)
        ) {
          await click(
            `[data-test-storeknoxInventoryDetails-actionBtn='${actionBtnToClick.id}']`
          );

          assert.true(currentURL().includes(actionBtnToClick.id));

          const actionBtnElement = find(
            '[data-test-storeknoxInventoryDetails-pageInfoTag]'
          );

          assert.dom(actionBtnElement).isDisabled();

          assertActionBtnFeatures(assert, actionBtnToClick, actionBtnElement);

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-actionBtn-rightIcon]',
              actionBtnElement
            )
            .doesNotExist();
        }
      }
    );

    /**
     * ===============================
     * Shows archived banner
     * ===============================
     */
    test('it shows archived banner in inventory details page if app is archived', async function (assert) {
      assert.expect(3);

      const archivedApp = this.createArchivedApp();

      await visit(`/dashboard/storeknox/inventory-details/${archivedApp.id}`);

      assert.dom('[data-test-storeknoxInventoryDetails-banner]').exists();

      assert.dom('[data-test-storeknoxInventoryDetails-bannerIcon]').exists();

      const formatDate = (date) => dayjs(date).format('MMM DD, YYYY');

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: '[data-test-storeknoxInventoryDetails-bannerText]',
        message: t('storeknox.archivedBannerMessage', {
          archivedDate: formatDate(archivedApp.archived_on),
          unarchiveDate: formatDate(archivedApp.unarchive_available_on),
        }),
      });
    });

    /**
     * ===============================
     * Archive/Unarchive App
     * ===============================
     */
    test.each(
      'test: archive app',
      [{ doArchiveApp: false }, { doArchiveApp: true }],
      async function (assert, { doArchiveApp }) {
        const archivedApp = doArchiveApp
          ? this.server.create('sk-inventory-app', 'withApprovedStatus', {
              monitoring_enabled: true,
            })
          : this.createArchivedApp({ monitoring_enabled: true });

        // Server Mocks
        this.server.put('/v2/sk_app/:id/update_app_status', (schema, req) => {
          const { app_status } = JSON.parse(req.requestBody);

          schema.db.skInventoryApps.update(`${req.params.id}`, {
            app_status,
          });

          const appStatusDisplay =
            ENUMS.SK_APP_STATUS.BASE_CHOICES[app_status].key;

          return {
            id: req.params.id,
            app_status,
            app_status_display: appStatusDisplay,
          };
        });

        // Test Start
        await visit(`/dashboard/storeknox/inventory-details/${archivedApp.id}`);

        // Archive App Banner
        const archiveAppBannerSelector =
          '[data-test-storeknoxInventoryDetails-banner]';

        if (doArchiveApp) {
          assert.dom(archiveAppBannerSelector).doesNotExist();
        } else {
          assert.dom(archiveAppBannerSelector).exists();
        }

        // Archive/Unarchive Action
        const archiveButton = find(
          '[data-test-storeknoxInventoryDetails-archiveButton]'
        );

        const archiveButtonIconElement = find(
          '[data-test-storeknoxInventoryDetails-archiveButtonIcon]'
        );

        assert.dom(archiveButton).doesNotHaveAttribute('disabled');

        assert
          .dom(archiveButtonIconElement)
          .hasAttribute('icon', doArchiveApp ? /archive/ : /unarchive/);

        await click(archiveButton);

        assert
          .dom('[data-test-storeknoxInventoryDetails-archiveDrawer]')
          .exists();

        assert
          .dom('[data-test-storeknoxInventoryDetails-archiveDrawerHeading]')
          .hasText(t('confirmation'));

        compareInnerHTMLWithIntlTranslation(assert, {
          selector:
            '[data-test-storeknoxInventoryDetails-archiveDrawerMessage]',

          message: t(
            doArchiveApp
              ? 'storeknox.archiveLockPeriodMessage'
              : 'storeknox.unarchiveLockPeriodMessage',
            { appTitle: archivedApp.app_metadata.title }
          ),
        });

        if (doArchiveApp) {
          compareInnerHTMLWithIntlTranslation(assert, {
            selector: '[data-test-storeknoxInventoryDetails-archiveDrawerNote]',
            message: t('storeknox.archiveLockPeriodNote', {
              date: dayjs().add(6, 'months').format('MMM DD, YYYY'),
            }),
          });
        } else {
          assert
            .dom('[data-test-storeknoxInventoryDetails-archiveDrawerNote]')
            .doesNotExist();
        }

        assert
          .dom('[data-test-storeknoxInventoryDetails-archiveDrawerConfirmBtn]')
          .containsText(t('yes'))
          .containsText(
            doArchiveApp ? t('storeknox.archive') : t('storeknox.unarchive')
          );

        assert
          .dom('[data-test-storeknoxInventoryDetails-archiveDrawerCancelBtn]')
          .hasText(t('cancel'));

        await click(
          '[data-test-storeknoxInventoryDetails-archiveDrawerConfirmBtn]'
        );

        // Wait for the banner to be updated
        await waitUntil(
          () =>
            doArchiveApp
              ? find(archiveAppBannerSelector)
              : !find(archiveAppBannerSelector),
          {
            timeout: 10000,
          }
        );

        // Assert the banner is updated
        if (doArchiveApp) {
          assert.dom(archiveAppBannerSelector).exists();
        } else {
          assert.dom(archiveAppBannerSelector).doesNotExist();
        }

        // Assert the unarchive button is disabled
        if (doArchiveApp) {
          assert.dom(archiveButton).isDisabled();

          await triggerEvent(archiveButtonIconElement, 'mouseenter');

          assert
            .dom('[data-test-ak-tooltip-content]')
            .containsText(t('storeknox.actionDisabledDueToLockPeriod'));

          await triggerEvent(archiveButtonIconElement, 'mouseleave');
        } else {
          assert.dom(archiveButton).isNotDisabled();
        }

        // Assert the success message
        const notifyService = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notifyService.successMsg,
          t(
            doArchiveApp
              ? 'storeknox.appArchivedSuccessfully'
              : 'storeknox.appUnarchivedSuccessfully'
          )
        );
      }
    );

    /**
     * =================================
     * HIDE MONITORING TOGGLE SWITCH
     * =================================
     */
    test('test: hides monitoring toggle switch when app is archived', async function (assert) {
      const archivedApp = this.createArchivedApp();

      // Test Start
      await visit(`/dashboard/storeknox/inventory-details/${archivedApp.id}`);

      // Archive App Banner
      assert.dom('[data-test-storeknoxInventoryDetails-banner]').exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-archiveButton]')
        .doesNotHaveAttribute('disabled');

      assert
        .dom('[data-test-storeknoxInventoryDetails-archiveButtonIcon]')
        .hasAttribute('icon', /unarchive/);

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringStatusToggleContainer]'
        )
        .doesNotExist();
    });
  }
);
