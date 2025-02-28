import { visit, find, click, waitFor, triggerEvent } from '@ember/test-helpers';
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

// Checks the result info in the latest va results section of an SkApp
const doVaResultsChecks = (assert, coreProjectLatestVersion) => {
  assert
    .dom('[data-test-storeknoxInventoryDetails-latestVAResultsSummary]')
    .hasText(t('summary'));

  // Check VA Results Risk Summary
  const vaResultsRiskInfo = {
    critical: coreProjectLatestVersion.get('countRiskCritical'),
    high: coreProjectLatestVersion.get('countRiskHigh'),
    medium: coreProjectLatestVersion.get('countRiskMedium'),
    low: coreProjectLatestVersion.get('countRiskLow'),
    passed: coreProjectLatestVersion.get('countRiskNone'),
    untested: coreProjectLatestVersion.get('countRiskUnknown'),
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
};

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
      'it renders header and app details sections',
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
            // Required to test the pending state illustration and text
            store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.PENDING,
          }
        );

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
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}`
        );

        assert
          .dom('[data-test-storeknoxInventoryDetails-breadcrumbContainer]')
          .exists();

        const statusToggleSelector =
          '[data-test-storeknoxInventoryDetails-monitoringStatusToggle] [data-test-toggle-input]';

        // Toggling cannot be performed by members
        if (cannot_toggle && turn_on) {
          assert.dom(statusToggleSelector).isNotChecked().isDisabled();

          const monitoringStatusToggleTooltip = find(
            '[data-test-storeknoxInventoryDetails-monitoringStatusToggleTooltip]'
          );

          await triggerEvent(monitoringStatusToggleTooltip, 'mouseenter');

          const tooltipContentElement = find('[data-test-ak-tooltip-content]');

          assert
            .dom(tooltipContentElement)
            .containsText(t('storeknox.cannotPerformStatusToggleText'));

          await triggerEvent(monitoringStatusToggleTooltip, 'mouseleave');

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
      }
    );

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

      doVaResultsChecks(
        assert,
        inventoryAppRecord.get('coreProjectLatestVersion')
      );
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

      // Server mocks
      this.server.get('/v2/files/:id', () => new Response(404), 404);

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
          'withApprovedStatus',
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
      }
    );

    test('it initiates app upload', async function (assert) {
      assert.expect(25);

      // Models
      const vulnerabilities = this.server.createList('vulnerability', 7);

      const analyses = vulnerabilities.map((v) =>
        this.server.create('analysis', { vulnerability: v.id }).toJSON()
      );

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
      this.server.get('/v2/files/:id', (schema, req) => {
        return {
          ...schema.files.find(`${req.params.id}`)?.toJSON(),
          analyses,
        };
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

      doVaResultsChecks(
        assert,
        inventoryAppRecord.get('coreProjectLatestVersion')
      );
    });

    // Checks the action btn props
    const assertActionBtnFeatures = (assert, action, actionElement) => {
      assert.dom(actionElement).hasText(action.label);

      if (action.featureInProgress) {
        assert.dom(actionElement).hasClass(/feature-in-progress/);
      } else if (action.needsAction) {
        assert
          .dom(actionElement)
          .doesNotHaveClass(/feature-in-progress/)
          .hasClass(/needs-action/);
      } else {
        assert
          .dom(actionElement)
          .doesNotHaveClass(/feature-in-progress/)
          .doesNotHaveClass(/needs-action/);
      }

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-actionBtn-leftIcon]',
          actionElement
        )
        .hasClass(action.featureInProgress ? /auto-fix-high/ : /report/);
    };

    test.each(
      'test: actions list section',
      ['malware-detected', 'unscanned-version', 'brand-abuse'].reduce(
        (opt, actionRoute) =>
          opt.concat([
            {
              store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.UNSCANNED,
              actionRoute,
            },
            {
              store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.SCANNED,
              actionRoute,
            },
          ]),
        []
      ),
      async function (assert, { store_monitoring_status, actionRoute }) {
        // Models
        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          { store_monitoring_status }
        );

        const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

        // Test Start
        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
        );

        // Last monitored date
        assert
          .dom('[data-test-storeknoxInventoryDetails-lastMonitoredDateIcon]')
          .exists();

        assert
          .dom('[data-test-storeknoxInventoryDetails-lastMonitoredDate]')
          .hasText(
            dayjs(inventoryAppRecord.get('lastMonitoredOn')).format(
              'MMM DD, YYYY'
            )
          );

        // Check for needs action tooltip
        const tooltipContentSelector = '[data-test-ak-tooltip-content]';

        const lastMonitoredDateTooltipElement = find(
          '[data-test-storeknoxInventoryDetails-lastMonitoredDateTooltip]'
        );

        await triggerEvent(lastMonitoredDateTooltipElement, 'mouseenter');

        assert
          .dom(tooltipContentSelector)
          .containsText(t('storeknox.lastMonitoredDate'));

        await triggerEvent(lastMonitoredDateTooltipElement, 'mouseleave');

        // Current Actions list
        const actionsList = [
          {
            id: 'unscanned-version',
            label: t('storeknox.unscannedVersion'),
            needsAction:
              inventoryAppRecord.storeMonitoringStatus ===
              ENUMS.SK_APP_MONITORING_STATUS.UNSCANNED,
          },
          {
            id: 'brand-abuse',
            label: t('storeknox.brandAbuse'),
            featureInProgress: true,
          },
          {
            id: 'malware-detected',
            label: t('storeknox.malwareDetected'),
            featureInProgress: true,
          },
        ];

        // No. of items requiring action
        const needsActionCount = actionsList.reduce(
          (count, action) => (action.needsAction ? count + 1 : count),
          0
        );

        // Actions List Assertions
        assert
          .dom('[data-test-storeknoxInventoryDetails-actionListHeaderIcon]')
          .exists();

        assert
          .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
          .containsText(t('storeknox.actionNeeded'))
          .containsText(needsActionCount);

        actionsList.forEach((action) => {
          const actionElement = find(
            `[data-test-storeknoxInventoryDetails-actionBtn='${action.id}']`
          );

          assertActionBtnFeatures(assert, action, actionElement);

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-actionBtn-rightIcon]',
              actionElement
            )
            .exists();
        });

        // Check if the respective page info tag have the same status as in the actions list
        const actionBtnToClick = actionsList.find((a) => a.id === actionRoute);

        await click(
          `[data-test-storeknoxInventoryDetails-actionBtn='${actionBtnToClick.id}']`
        );

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
    );
  }
);
