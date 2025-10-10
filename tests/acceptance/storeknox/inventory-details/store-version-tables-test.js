import {
  visit,
  click,
  waitUntil,
  find,
  findAll,
  triggerEvent,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import Service from '@ember/service';

// Create notification service stub
class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  success(msg) {
    this.successMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }

  setDefaultAutoClear() {}
}

module(
  'Acceptance | storeknox/inventory-details/store-version-tables',
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

      this.owner.register('service:notifications', NotificationsStub);

      // Server mocks
      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      this.server.get('/v2/sk_app/:id/sk_app_version', (schema) => {
        const skAppVersions = schema.skAppVersions.all().models;

        return {
          count: skAppVersions.length,
          next: null,
          previous: null,
          results: skAppVersions,
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

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      // Services
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
      'it renders with empty versions table',
      ['unscanned-version', 'unscanned-version/history'],
      async function (assert, versionPage) {
        // Models
        const core_prj_latest_file = this.server.create('file');
        const core_project = this.server.create('project');

        // Models
        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          {
            core_project: core_project.id,
            core_project_latest_version: core_prj_latest_file.id,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
          }
        );

        // Server Mocks
        this.server.get('/v2/sk_app/:id/sk_app_version', () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        });

        // Test Start
        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}/${versionPage}`
        );

        const isHistoryPage = versionPage.includes('history');

        assert
          .dom(
            isHistoryPage
              ? '[data-test-storeknoxInventoryDetails-unscannedVersions-tableEmpty-historyErrorIllustration]'
              : '[data-test-storeknoxInventoryDetails-unscannedVersions-tableEmpty-detailsErrorIllustration]'
          )
          .exists();

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-unscannedVersions-tableEmpty-emptyHeaderText]'
          )
          .hasText(t('notFound'));

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-unscannedVersions-tableEmpty-emptyBodyText]'
          )
          .hasText(
            isHistoryPage
              ? t('storeknox.monitoringHistoryTableEmpty')
              : t('storeknox.monitoringDetailsTableEmpty')
          );
      }
    );

    test.each(
      'it renders the different initiate upload states',
      [
        // SCENARIO 1: When upload has not been initiated
        {
          canInitiateUpload: true,
          canAccessSubmission: true,
          hasSubmission: false,
          platform: ENUMS.PLATFORM.ANDROID,
        },

        // SCENARIO 2: When upload has not been initiated
        {
          canInitiateUpload: true,
          canAccessSubmission: true,
          hasSubmission: false,
          platform: ENUMS.PLATFORM.IOS,
        },
        // When upload is in progress
        // SCENARIO 3: For initiator who has submission access
        {
          canInitiateUpload: false,
          canAccessSubmission: true,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.STORE_VALIDATING_URL,
          uploadInProgress: true,
        },

        // SCENARIO 4: For non-initiator who cannot access submission
        {
          canInitiateUpload: false,
          canAccessSubmission: false,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.STORE_UPLOADING,
          uploadInProgress: true,
          isOwner: false,
        },

        // SCENARIO 5: For non-initiator who cannot access submission and is owner
        {
          canInitiateUpload: false,
          canAccessSubmission: false,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.STORE_UPLOADING,
          uploadInProgress: true,
          isOwner: true,
        },

        // When upload fails
        // SCENARIO 6: For initiator who has submission access
        {
          canInitiateUpload: true,
          canAccessSubmission: true,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
          subError: 'Upload has failed without reason',
          uploadFailed: true,
        },

        // SCENARIO 7: For non-initiator who cannot access submission
        {
          canInitiateUpload: true,
          canAccessSubmission: false,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
          uploadFailed: true,
        },

        // When upload is analyzing but sk_app does not have latest file yet
        // SCENARIO 8: For initiator who can access submission
        {
          canInitiateUpload: false,
          canAccessSubmission: true,
          hasSubmission: true,
          subStatus: ENUMS.SUBMISSION_STATUS.ANALYZING,
          uploadInProgress: false,
        },

        // When app has not been uploaded yet
        // SCENARIO 9: Disabled upload button if app is archived
        {
          canInitiateUpload: true,
          canAccessSubmission: true,
          hasSubmission: false,
          isArchived: true,
          platform: ENUMS.PLATFORM.IOS,
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
          platform,
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

        const core_prj_latest_file = this.server.create('file');
        const core_project = this.server.create('project');

        // Models
        const inventoryApp = this.server.create(
          'sk-inventory-app',
          isArchived ? 'withArchivedStatus' : 'withApprovedStatus',
          {
            core_project: core_project.id,
            core_project_latest_version: core_prj_latest_file.id,
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            app_metadata: this.server.create('sk-app-metadata', { platform }),
          }
        );

        const skAppVersion = this.server.create('sk-app-version', {
          sk_app: inventoryApp.id,
          can_initiate_upload: canInitiateUpload,
          upload_submission: hasSubmission ? submission.id : null,
          file_created_on: null,
          core_project: null,
          file: null,
        });

        this.store.push(
          this.store.normalize('sk-app-version', skAppVersion.toJSON())
        );

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
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}/unscanned-version`
        );

        await waitUntil(() => find('[data-test-skAppVersionTable-wrapper]'), {
          timeout: 10000,
        });

        const storeVersionRows = findAll('[data-test-skAppVersionTable-row]');

        // Should contain one store-version
        assert.strictEqual(storeVersionRows.length, 1);

        // Check upload actions
        const storeVersionRow = storeVersionRows[0];

        // SCENARIO 1: Upload has not been initiated for all user roles
        const scenario_1 =
          !hasSubmission &&
          canInitiateUpload &&
          platform === ENUMS.PLATFORM.ANDROID;

        // SCENARIO 7: When Upload fails and current user is not the initiator for all user roles
        const scenario_7 =
          !canAccessSubmission &&
          uploadFailed &&
          hasSubmission &&
          canInitiateUpload;

        if (scenario_1 || scenario_7) {
          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUploadBtnIcon]',
              storeVersionRow
            )
            .exists();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUploadBtn]',
              storeVersionRow
            )
            .isNotDisabled()
            .hasText(t('storeknox.initiateUpload'));

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUploadBetaChip]',
              storeVersionRow
            )
            .hasText(t('beta'));
        }

        // SCENARIO 2: Upload has not been initiated for all user roles but app is iOS
        // SCENARIO 9: Disabled upload button if app is archived

        const scenario_2 =
          !hasSubmission &&
          canInitiateUpload &&
          platform === ENUMS.PLATFORM.IOS;

        if (scenario_2 || isArchived) {
          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUploadBtnIcon]',
              storeVersionRow
            )
            .exists();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUploadBtn]',
              storeVersionRow
            )
            .isDisabled()
            .hasText(t('storeknox.initiateUpload'));

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUploadBetaChip]',
              storeVersionRow
            )
            .doesNotExist();

          const initiateUploadBtnTooltip = find(
            '[data-test-skAppVersionTable-initiateUploadBtn-tooltip]'
          );

          await triggerEvent(initiateUploadBtnTooltip, 'mouseenter');

          // Only the tooltip text is different for archived apps
          assert
            .dom('[data-test-skAppVersionTable-initiateUploadBtn-tooltipText]')
            .hasText(
              isArchived
                ? t('storeknox.cannotUploadForArchivedApps')
                : t('storeknox.initiateUploadComingSoon')
            );
        }

        // SCENARIO 3: When Upload is in progress and current user is the initiator
        if (
          uploadInProgress &&
          !canInitiateUpload &&
          canAccessSubmission &&
          hasSubmission
        ) {
          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]',
              storeVersionRow
            )
            .hasText(`${t('uploading')}...`);

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessIcon]',
              storeVersionRow
            )
            .exists();
        }

        // SCENARIO 4: When Upload is in progress and current user is not the initiator
        if (!canInitiateUpload && !canAccessSubmission && hasSubmission) {
          assert
            .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
            .doesNotExist();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-statusIcon]',
              storeVersionRow
            )
            .exists()
            .hasClass(/info/);

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-statusHeaderText]',
              storeVersionRow
            )
            .hasText(t('storeknox.initiateUploadMessages.uploadInitiated'));

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-statusInfoModalTrigger]',
              storeVersionRow
            )
            .hasText(t('details'));

          await click(
            '[data-test-skAppVersionTable-initiateUpload-statusInfoModalTrigger]'
          );

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-statusInfoIllustration]'
            )
            .exists();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-uploadSubTextMsg]'
            )
            .hasText(t('storeknox.initiateUploadMessages.uploadInitiatedDesc'));

          assert
            .dom('[data-test-skAppVersionTable-initiateUpload-retryBtn]')
            .isDisabled()
            .hasText(t('storeknox.retryUpload'));

          assert
            .dom('[data-test-skAppVersionTable-initiateUpload-retryCancelBtn]')
            .isNotDisabled()
            .hasText(t('cancel'));

          // SCENARIO 5: When Upload is in progress and current user is not the initiator but an owner
          assert
            .dom('[data-test-storeknoxInventoryDetails-uploadHeaderMsg]')
            .hasText(
              t(
                isOwner
                  ? 'storeknox.initiateUploadMessages.uploadPendingCompletion'
                  : 'storeknox.initiateUploadMessages.uploadInitiatedHeader'
              )
            );
        }

        // SCENARIO 6: When Upload fails and current user is the initiator
        if (
          uploadFailed &&
          canAccessSubmission &&
          hasSubmission &&
          canInitiateUpload
        ) {
          assert
            .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
            .doesNotExist();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-statusIcon]',
              storeVersionRow
            )
            .exists()
            .hasClass(/error/);

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-statusHeaderText]',
              storeVersionRow
            )
            .hasText(t('error'));

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-statusInfoModalTrigger]',
              storeVersionRow
            )
            .hasText(t('storeknox.checkDetails'));

          await click(
            '[data-test-skAppVersionTable-initiateUpload-statusInfoModalTrigger]'
          );

          assert
            .dom('[data-test-storeknoxInventoryDetails-uploadHeaderMsg]')
            .hasText(t('storeknox.initiateUploadMessages.uploadIncomplete'));

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-uploadSubTextMsg]'
            )
            .hasText(submissionRecord.reason);

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-lastUploadAttemptCalendarIcon]'
            )
            .exists();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-lastUploadAttempt]'
            )
            .containsText(t('storeknox.lastUploadAttemptText'));

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-lastUploadAttempt]'
            )
            .containsText(t('storeknox.lastUploadAttemptText'))
            .containsText(
              dayjs(submissionRecord.createdOn).format('Do MMM YYYY')
            );

          assert
            .dom('[data-test-skAppVersionTable-initiateUpload-retryBtn]')
            .isNotDisabled()
            .hasText(t('storeknox.retryUpload'));

          assert
            .dom('[data-test-skAppVersionTable-initiateUpload-retryCancelBtn]')
            .isNotDisabled()
            .hasText(t('cancel'));
        }

        // When upload is analyzing but sk_app does not have latest file yet
        // SCENARIO 8: For initiator who can access submission
        if (
          !uploadInProgress &&
          !canInitiateUpload &&
          canAccessSubmission &&
          hasSubmission
        ) {
          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]'
            )
            .exists();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]',
              storeVersionRow
            )
            .hasText(t('completed'));
        }
      }
    );

    test.each(
      'it initiates app upload',
      [
        { subStatus: ENUMS.SUBMISSION_STATUS.ANALYZING, isCompleted: true },
        {
          subStatus: ENUMS.SUBMISSION_STATUS.STORE_VALIDATING_URL,
          isCompleted: false,
        },
      ],
      async function (assert, { subStatus, isCompleted }) {
        // Models
        const submission = this.server.create('submission', {
          status: subStatus,
        });

        this.store.push(
          this.store.normalize('submission', submission.toJSON())
        );

        const file = this.server.create('file');
        const core_prj_latest_file = this.server.create('file');
        const core_project = this.server.create('project');

        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          {
            core_project: core_project.id,
            core_project_latest_version: core_prj_latest_file.id,

            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,

            app_metadata: this.server.create('sk-app-metadata', {
              platform: ENUMS.PLATFORM.ANDROID,
            }),
          }
        );

        const skAppVersion = this.server.create('sk-app-version', {
          sk_app: inventoryApp.id,
          can_initiate_upload: true,
          upload_submission: null,
          file: null,
          file_created_on: null,
        });

        const skAppVersionRecord = this.store.push(
          this.store.normalize('sk-app-version', skAppVersion.toJSON())
        );

        // Server Mocks
        this.server.post('/v2/sk_app_versions/:id/sk_initiate_upload', () => {
          this.set('uploadInitiated', true);

          this.server.db.skAppVersions.update(skAppVersionRecord.id, {
            can_initiate_upload: false,
          });

          return {
            id: submission.id,
            status: submission.status,
          };
        });

        this.server.get('v2/sk_app_versions/:id', (schema, req) => {
          if (this.uploadInitiated) {
            // Modify skAppVersion props to completed state after upload is initiated
            this.server.db.skAppVersions.update(req.params.id, {
              can_initiate_upload: false,
              file: file.id,
              file_created_on: faker.date.past(),
              upload_submission: null,
            });
          }

          return schema.skAppVersions.find(req.params.id).toJSON();
        });

        this.server.get('v2/sk_app_detail/:id', (schema, req) => {
          const app = schema.skInventoryApps.find(req.params.id);

          return { ...app.toJSON(), app_metadata: app.app_metadata };
        });

        this.server.get('/submissions/:id', (schema, req) => {
          return schema.submissions.find(`${req.params.id}`)?.toJSON();
        });

        // Test Start
        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}/unscanned-version`
        );

        await waitUntil(() => find('[data-test-skAppVersionTable-wrapper]'), {
          timeout: 10000,
        });

        const storeVersionRows = findAll('[data-test-skAppVersionTable-row]');

        // Should contain one store-version
        assert.strictEqual(storeVersionRows.length, 1);

        // Check upload actions
        const storeVersionRow = storeVersionRows[0];

        assert
          .dom(
            '[data-test-skAppVersionTable-initiateUploadBtn]',
            storeVersionRow
          )
          .hasText(t('storeknox.initiateUpload'));

        await click('[data-test-skAppVersionTable-initiateUploadBtn]');

        await waitUntil(
          () =>
            find(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]'
            ),
          {
            timeout: 10000,
          }
        );

        if (isCompleted) {
          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]',
              storeVersionRow
            )
            .exists();

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]',
              storeVersionRow
            )
            .hasText(t('completed'));
        } else {
          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]',
              storeVersionRow
            )
            .hasText(`${t('uploading')}...`);

          assert
            .dom(
              '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessIcon]',
              storeVersionRow
            )
            .exists();
        }
      }
    );

    test('it triggers reload on app upload error', async function (assert) {
      this.currentOrganizationMe.update({
        is_owner: false,
      });

      // Models
      const submission = this.server.create('submission', {
        status: ENUMS.SUBMISSION_STATUS.ANALYZING,
      });

      const initial_submission = this.server.create('submission', {
        status: ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
      });

      this.store.push(this.store.normalize('submission', submission.toJSON()));

      const initialSubmissionRecord = this.store.push(
        this.store.normalize('submission', initial_submission.toJSON())
      );

      const file = this.server.create('file');
      const core_prj_latest_file = this.server.create('file');
      const core_project = this.server.create('project');

      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          core_project: core_project.id,
          core_project_latest_version: core_prj_latest_file.id,

          store_monitoring_status:
            ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,

          app_metadata: this.server.create('sk-app-metadata', {
            platform: ENUMS.PLATFORM.ANDROID,
          }),
        }
      );

      const skAppVersion = this.server.create('sk-app-version', {
        sk_app: inventoryApp.id,
        upload_submission: initial_submission.id,
        can_initiate_upload: true,
        file: null,
        file_created_on: null,
      });

      const skAppVersionRecord = this.store.push(
        this.store.normalize('sk-app-version', skAppVersion.toJSON())
      );

      // Server Mocks
      this.server.post('/v2/sk_app_versions/:id/sk_initiate_upload', () => {
        this.set('uploadInitiated', true);

        this.server.db.skAppVersions.update(skAppVersionRecord.id, {
          can_initiate_upload: false,
        });

        return {
          id: submission.id,
          status: submission.status,
        };
      });

      this.server.get('v2/sk_app_versions/:id', (schema, req) => {
        if (this.uploadInitiated) {
          // Modify skAppVersion props to completed state after upload is initiated
          this.server.db.skAppVersions.update(req.params.id, {
            can_initiate_upload: false,
            file: file.id,
            file_created_on: faker.date.past(),
            upload_submission: null,
          });
        }

        return schema.skAppVersions.find(req.params.id).toJSON();
      });

      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      this.server.get('/submissions/:id', (schema, req) => {
        return schema.submissions.find(`${req.params.id}`)?.toJSON();
      });

      // Test Start
      await visit(
        `/dashboard/storeknox/inventory-details/${inventoryApp.id}/unscanned-version`
      );

      await waitUntil(() => find('[data-test-skAppVersionTable-wrapper]'), {
        timeout: 10000,
      });

      const storeVersionRows = findAll('[data-test-skAppVersionTable-row]');

      // Should contain one store-version
      assert.strictEqual(storeVersionRows.length, 1);

      // Check upload actions
      const storeVersionRow = storeVersionRows[0];

      assert
        .dom('[data-test-storeknoxInventoryDetails-initiateUploadBtn]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-skAppVersionTable-initiateUpload-statusIcon]',
          storeVersionRow
        )
        .exists()
        .hasClass(/error/);

      assert
        .dom(
          '[data-test-skAppVersionTable-initiateUpload-statusHeaderText]',
          storeVersionRow
        )
        .hasText(t('error'));

      assert
        .dom(
          '[data-test-skAppVersionTable-initiateUpload-statusInfoModalTrigger]',
          storeVersionRow
        )
        .hasText(t('storeknox.checkDetails'));

      await click(
        '[data-test-skAppVersionTable-initiateUpload-statusInfoModalTrigger]'
      );

      assert
        .dom('[data-test-storeknoxInventoryDetails-uploadHeaderMsg]')
        .hasText(t('storeknox.initiateUploadMessages.uploadIncomplete'));

      assert
        .dom('[data-test-skAppVersionTable-initiateUpload-uploadSubTextMsg]')
        .hasText(initialSubmissionRecord.reason);

      assert
        .dom(
          '[data-test-skAppVersionTable-initiateUpload-lastUploadAttemptCalendarIcon]'
        )
        .exists();

      assert
        .dom('[data-test-skAppVersionTable-initiateUpload-lastUploadAttempt]')
        .containsText(t('storeknox.lastUploadAttemptText'));

      assert
        .dom('[data-test-skAppVersionTable-initiateUpload-lastUploadAttempt]')
        .containsText(t('storeknox.lastUploadAttemptText'))
        .containsText(
          dayjs(initialSubmissionRecord.createdOn).format('Do MMM YYYY')
        );

      assert
        .dom('[data-test-skAppVersionTable-initiateUpload-retryBtn]')
        .isNotDisabled()
        .hasText(t('storeknox.retryUpload'));

      assert
        .dom('[data-test-skAppVersionTable-initiateUpload-retryCancelBtn]')
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-skAppVersionTable-initiateUpload-retryBtn]');

      await waitUntil(
        () =>
          find(
            '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]'
          ),
        {
          timeout: 5000,
        }
      );

      //The final submission is a completed record
      assert
        .dom(
          '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]',
          storeVersionRow
        )
        .exists();

      assert
        .dom(
          '[data-test-skAppVersionTable-initiateUpload-loadingOrSuccessText]',
          storeVersionRow
        )
        .hasText(t('completed'));
    });
  }
);
