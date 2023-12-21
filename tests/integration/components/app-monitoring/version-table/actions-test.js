import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';

import ENUMS from 'irene/enums';
import dayjs from 'dayjs';

// Upload statuses
const APP_UPLOAD_COMPLETE_STATUSES = [ENUMS.SUBMISSION_STATUS.ANALYZING];

const APP_UPLOADING_STATUSES = [
  ENUMS.SUBMISSION_STATUS.STORE_UPLOADING,
  ENUMS.SUBMISSION_STATUS.STORE_DOWNLOADING,
  ENUMS.SUBMISSION_STATUS.VALIDATING,
  ENUMS.SUBMISSION_STATUS.STORE_VALIDATING_URL,
  ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_PREPARE,
];

const APP_UPLOAD_ERROR_STATUSES = [
  ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
  ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
  ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
];

// Common Module Selectors
const COMMON_SELECTORS = {
  initiateUploadBtn: '[data-test-amVersionTable-initiateUploadBtn]',
  loadingOrCompletedIconSelector:
    '[data-test-amVersionTable-initiateUpload-loadingOrSuccessIcon]',
  loadingOrCompletedTextSelector:
    '[data-test-amVersionTable-initiateUpload-loadingOrSuccessText]',
  errorInfoModalContainer:
    '[data-test-amVersionTable-initiateUpload-errorInfoModalContainer]',
};

module(
  'Integration | Component | app-monitoring/version-table/actions',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/am_app_versions/:id', (schema, req) => {
        return schema.amAppVersions.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/submissions/:id', (schema, req) => {
        return schema.submissions.find(`${req.params.id}`)?.toJSON();
      });

      const store = this.owner.lookup('service:store');

      const createSubmission = (payload = {}) => {
        const submission = this.server.create('submission', {
          status: ENUMS.SUBMISSION_STATUS.VALIDATING,
          ...payload,
        });

        return store.push(store.normalize('submission', submission.toJSON()));
      };

      // File Record
      const file = this.server.create('file');

      // Project Record
      const project = this.server.create('project', {
        last_file_id: file.id,
      });

      // AmApp Record.
      const amApp = this.server.create('am-app', {
        id: 1,
        latest_file: file.id,
        project: project.id,
      });

      this.setProperties({
        createSubmission,
        store,
        file,
        amApp,
      });
    });

    test.each(
      'it renders intiate upload btn if unscanned',
      [true, false],
      async function (assert, isScanned) {
        // AmAppVersion
        const versionHasLatestFile = isScanned;

        const amAppVersion = this.server.create('am-app-version', {
          id: 1,
          latest_file: versionHasLatestFile ? this.file.id : null,
          am_app: this.amApp.id,
        });

        const normalizedAmAppVersion = this.store.normalize(
          'am-app-version',
          amAppVersion.toJSON()
        );

        this.amAppVersion = this.store.push(normalizedAmAppVersion);

        await render(
          hbs`<AppMonitoring::VersionTable::Actions @amAppVersion={{this.amAppVersion}} />`
        );

        // Hide button if scanned
        if (isScanned) {
          assert
            .dom('[data-test-amVersionTable-noActionRequired]')
            .exists()
            .containsText('t:noActionRequired:()');
        }

        // Show button if unscanned
        if (!isScanned) {
          assert
            .dom('[data-test-amVersionTable-initiateUploadBtn]')
            .exists()
            .containsText('t:appMonitoringModule.initiateUpload:()');
        }
      }
    );

    test.each(
      'it initiates app upload on initiate button click',
      [
        ...APP_UPLOADING_STATUSES,
        ...APP_UPLOAD_ERROR_STATUSES,
        ...APP_UPLOAD_COMPLETE_STATUSES,
      ],
      async function (assert, status) {
        this.createSubmission({ status });

        this.server.post(
          '/v2/am_app_versions/:id/initiate_upload',
          (schema, req) => {
            return {
              id: req.params.id,
              status,
            };
          }
        );

        const amAppVersion = this.server.create('am-app-version', {
          id: 1,
          latest_file: null,
          am_app: this.amApp.id,
        });

        const normalizedAmAppVersion = this.store.normalize(
          'am-app-version',
          amAppVersion.toJSON()
        );

        this.amAppVersion = this.store.push(normalizedAmAppVersion);

        await render(
          hbs`<AppMonitoring::VersionTable::Actions @amAppVersion={{this.amAppVersion}} />`
        );

        // Initiates app upload via URL
        await click(COMMON_SELECTORS.initiateUploadBtn);

        // Uploading state
        if (APP_UPLOADING_STATUSES.includes(status)) {
          assert
            .dom(COMMON_SELECTORS.loadingOrCompletedIconSelector)
            .exists()
            .hasClass(/downloading/);

          assert
            .dom(COMMON_SELECTORS.loadingOrCompletedTextSelector)
            .exists()
            .containsText('t:uploading:()');
        }

        // Completed state
        if (APP_UPLOAD_COMPLETE_STATUSES.includes(status)) {
          assert
            .dom(COMMON_SELECTORS.loadingOrCompletedIconSelector)
            .exists()
            .hasClass(/download-done/);

          assert
            .dom(COMMON_SELECTORS.loadingOrCompletedTextSelector)
            .exists()
            .containsText('t:completed:()');
        }

        // Error state
        if (APP_UPLOAD_ERROR_STATUSES.includes(status)) {
          assert
            .dom('[data-test-amVersionTable-initiateUpload-errorIcon]')
            .exists()
            .hasClass(/error/);

          assert
            .dom('[data-test-amVersionTable-initiateUpload-errorText]')
            .exists()
            .containsText('t:error:()');

          assert
            .dom(
              '[data-test-amVersionTable-initiateUpload-errorInfoModalTrigger]'
            )
            .exists()
            .hasText('t:appMonitoringModule.checkDetails:()');
        }

        assert.dom(COMMON_SELECTORS.initiateUploadBtn).doesNotExist();
      }
    );

    test('it shows app reload modal on app upload error', async function (assert) {
      const submissionRecord = this.createSubmission({
        status: APP_UPLOAD_ERROR_STATUSES[0],
      });

      this.server.post(
        '/v2/am_app_versions/:id/initiate_upload',
        (schema, req) => {
          return {
            id: req.params.id,
            status,
          };
        }
      );

      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: null,
        am_app: this.amApp.id,
      });

      const normalizedAmAppVersion = this.store.normalize(
        'am-app-version',
        amAppVersion.toJSON()
      );

      this.amAppVersion = this.store.push(normalizedAmAppVersion);

      await render(
        hbs`<AppMonitoring::VersionTable::Actions @amAppVersion={{this.amAppVersion}} />`
      );

      // Selectors
      const errorInfoModalTrigger =
        '[data-test-amVersionTable-initiateUpload-errorInfoModalTrigger]';

      // Initiates app upload via URL
      await click(COMMON_SELECTORS.initiateUploadBtn);

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorIcon]')
        .exists()
        .hasClass(/error/);

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorText]')
        .exists()
        .containsText('t:error:()');

      assert
        .dom(errorInfoModalTrigger)
        .exists()
        .hasText('t:appMonitoringModule.checkDetails:()');

      assert.dom(COMMON_SELECTORS.initiateUploadBtn).doesNotExist();

      await click(errorInfoModalTrigger);

      assert.dom(COMMON_SELECTORS.errorInfoModalContainer).exists();

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorInfoIllustration]')
        .exists();

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorReasonText]')
        .exists()
        .containsText(submissionRecord.reason);

      assert
        .dom(
          '[data-test-amVersionTable-initiateUpload-lastUploadAttemptCalendarIcon]'
        )
        .exists();

      assert
        .dom('[data-test-amVersionTable-initiateUpload-lastUploadAttempt]')
        .exists()
        .containsText('t:appMonitoringModule.lastUploadAttemptText:()')
        .containsText(dayjs(submissionRecord.createdOn).format('Do MMM YYYY'));

      assert
        .dom('[data-test-amVersionTable-initiateUpload-retryBtn]')
        .exists()
        .hasText('t:appMonitoringModule.retryUpload:()');

      assert
        .dom('[data-test-amVersionTable-initiateUpload-retryCancelBtn]')
        .exists()
        .hasText('t:cancel:()');
    });

    test('it triggers reload on app upload error', async function (assert) {
      this.setProperties({
        failedSubmissionRecord: this.createSubmission({
          id: 1,
          status: APP_UPLOAD_ERROR_STATUSES[0],
        }),
        completedSubmissionRecord: this.createSubmission({
          id: 2,
          status: APP_UPLOAD_COMPLETE_STATUSES[0],
        }),
      });

      this.server.post('/v2/am_app_versions/:id/initiate_upload', () => {
        if (this.createCompletedSubmission) {
          return { id: 2, status };
        }

        this.set('createCompletedSubmission', true);

        return { id: 1, status };
      });

      const amAppVersion = this.server.create('am-app-version', {
        id: 1,
        latest_file: null,
        am_app: this.amApp.id,
      });

      const normalizedAmAppVersion = this.store.normalize(
        'am-app-version',
        amAppVersion.toJSON()
      );

      this.amAppVersion = this.store.push(normalizedAmAppVersion);

      await render(
        hbs`<AppMonitoring::VersionTable::Actions @amAppVersion={{this.amAppVersion}} />`
      );

      // Selectors
      const initiateUploadBtn = '[data-test-amVersionTable-initiateUploadBtn]';

      const initiateUploadretryBtn =
        '[data-test-amVersionTable-initiateUpload-retryBtn]';

      const errorInfoModalTrigger =
        '[data-test-amVersionTable-initiateUpload-errorInfoModalTrigger]';

      // Initiates app upload via URL
      await click(initiateUploadBtn);

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorIcon]')
        .exists();

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorText]')
        .exists();

      assert
        .dom(errorInfoModalTrigger)
        .exists()
        .hasText('t:appMonitoringModule.checkDetails:()');

      assert.dom(initiateUploadBtn).doesNotExist();

      await click(errorInfoModalTrigger);

      assert.dom(COMMON_SELECTORS.errorInfoModalContainer).exists();

      assert.dom(initiateUploadretryBtn).exists();

      // This action creates a submission model that has a completed status
      // See line 338 above
      await click(initiateUploadretryBtn);

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorIcon]')
        .doesNotExist();

      assert
        .dom('[data-test-amVersionTable-initiateUpload-errorText]')
        .doesNotExist();

      assert
        .dom(COMMON_SELECTORS.loadingOrCompletedIconSelector)
        .exists()
        .hasClass(/download-done/);

      assert
        .dom(COMMON_SELECTORS.loadingOrCompletedTextSelector)
        .exists()
        .containsText('t:completed:()');
    });
  }
);
