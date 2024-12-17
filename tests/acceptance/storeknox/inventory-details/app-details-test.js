import { visit, find, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
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

module(
  'Acceptance | storeknox/inventory-details/app-details',
  function (hooks) {
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
      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
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

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
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

      this.setProperties({
        currentOrganizationMe,
        store,
        normalizeSKInventoryApp,
      });
    });

    test.each(
      'it renders app details',
      [{ available_on_appknox: true }, { available_on_appknox: false }],
      async function (assert, { available_on_appknox }) {
        const file = this.server.create('file');
        const core_project = this.server.create('project');

        // Models
        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          {
            core_project: available_on_appknox ? core_project.id : null,
            core_project_latest_version: available_on_appknox ? file.id : null,
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

        await click(storeLogoSelector);

        assert
          .dom('[data-test-storeknox-productInfoCaptionText]')
          .hasText(t('infoCapitalCase'));

        const productTitle = inventoryAppRecord.isAndroid
          ? t('storeknox.playStore')
          : t('storeknox.appStore');

        assert
          .dom('[data-test-storeknox-productInfo-appIsPartOfText]')
          .containsText(t('storeknox.appIsPartOf'))
          .containsText(productTitle);

        assert
          .dom('[data-test-storeknox-productInfo-appStoreLink]')
          .hasAttribute('href', inventoryAppRecord.appMetadata.url);

        assert
          .dom('[data-test-storeknox-productInfo-appStoreLinkBtn]')
          .hasText(t('storeknox.checkOn') + ` ${productTitle}`);

        await click(storeLogoSelector);

        if (available_on_appknox) {
          assert.dom('[data-test-storeknoxInventoryDetails-vaptLogo]').exists();
        }

        // Page Info tag
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

    // Check for monitoring results pending info
    const assertMonitoringPendingInfo = (assert) => {
      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingWithMonitoringOffIllustration]'
        )
        .exists();

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingOffHeaderText]'
        )
        .hasText(t('storeknox.enableMonitoringForApp'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingOff]'
        )
        .hasText(t('storeknox.monitoringResultsPendingWithMonitoringOff'));
    };

    // Check for monitoring results pending info when monitoring status is off
    const assertMonitoringPendingInfoWithMonitoringOff = (assert) => {
      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]'
        )
        .exists();

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingText]'
        )
        .hasText(t('storeknox.monitoringResultsPending'));
    };

    test.each(
      'monitoring status toggle',
      [
        { turn_on: true },
        { turn_on: false },
        { turn_on: true, cannot_toggle: true },
      ],
      async function (assert, { turn_on, cannot_toggle }) {
        // Models
        if (cannot_toggle) {
          this.currentOrganizationMe.update({
            is_owner: false,
            is_admin: false,
          });
        }

        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          {
            monitoring_enabled: turn_on ? false : true,

            // Meant to test the pending state illustration and text
            store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.PENDING,
          }
        );

        const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

        // Server mocks
        this.server.put(
          '/v2/sk_app/:id/update_monitoring_enabled_status',
          (schema, req) => {
            const { monitoring_enabled } = JSON.parse(req.requestBody);
            const app = schema.skInventoryApps.find(req.params.id);

            if (turn_on) {
              assert.true(monitoring_enabled);
            } else {
              assert.false(monitoring_enabled);
            }

            return {
              ...app.toJSON(),
              app_metadata: app.app_metadata,
              monitoring_enabled,
            };
          }
        );

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
        );

        assert
          .dom('[data-test-storeknoxInventoryDetails-breadcrumbContainer]')
          .exists();

        const statusToggleSelector =
          '[data-test-storeknoxInventoryDetails-monitoringStatusToggle] [data-test-toggle-input]';

        // Toggling cannot be performed by members
        if (cannot_toggle && turn_on) {
          assert.dom(statusToggleSelector).isNotChecked().isDisabled();

          return;
        }

        if (turn_on) {
          assert.dom(statusToggleSelector).isNotChecked();

          assertMonitoringPendingInfo(assert);
        } else {
          assert.dom(statusToggleSelector).isChecked();

          assertMonitoringPendingInfoWithMonitoringOff(assert);
        }

        await click(statusToggleSelector);

        if (turn_on) {
          assert.dom(statusToggleSelector).isChecked();

          assertMonitoringPendingInfoWithMonitoringOff(assert);
        } else {
          assert.dom(statusToggleSelector).isNotChecked();

          assertMonitoringPendingInfo(assert);
        }

        // TODO: Check chy this isn't working
        // Check notification message
        // const notify = this.owner.lookup('service:notifications');

        // assert.strictEqual(
        //   notify.successMsg,
        //   t('storeknox.monitoring') +
        //     ` ${turn_on ? t('enabled') : t('disabled')}`
        // );
      }
    );

    test('it renders VA results if core project latest version exists', async function (assert) {
      // Models
      const vulnerabilities = this.server.createList('vulnerability', 7);

      const analyses = vulnerabilities.map((v) =>
        this.server.create('analysis', { vulnerability: v.id }).toJSON()
      );

      const file = this.server.create('file');

      const coreProjectLatestVersion = this.store.push(
        this.store.normalize('file', {
          ...file.toJSON(),
          analyses,
        })
      );

      const core_project = this.server.create('project');

      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          core_project: core_project.id,
          core_project_latest_version: coreProjectLatestVersion.id,
        }
      );

      const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
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

      assert
        .dom('[data-test-storeknoxInventoryDetails-latestVAResultsSummary]')
        .hasText(t('summary'));

      // Check VA Results Risk Summary
      const vaResultsRiskInfo = {
        critical: coreProjectLatestVersion.countRiskCritical,
        high: coreProjectLatestVersion.countRiskHigh,
        medium: coreProjectLatestVersion.countRiskMedium,
        low: coreProjectLatestVersion.countRiskLow,
        passed: coreProjectLatestVersion.countRiskNone,
        untested: coreProjectLatestVersion.countRiskUnknown,
      };

      const vaResultsRiskInfoCategories = Object.keys(vaResultsRiskInfo);

      vaResultsRiskInfoCategories.forEach((category) => {
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

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-latestVAResultsSummary-categoryResultCount]',
            resultCatElement
          )
          .hasText(String(vaResultsRiskInfo[category]));
      });

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
    });

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

      const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

      // Server mocks
      this.server.get('/v2/files/:id', () => new Response(404), 404);

      // Test Start
      await visit(
        `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
      );

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

    test.skip('it renders upload to appknox CTA if app is not available on appknox', async function () {});

    test.skip('it initiates app upload', async function () {});
  }
);
