import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import dayjs from 'dayjs';

module('Integration | Component | upload-app/status/details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    const createSubmission = (payload = {}) => {
      const submission = this.server.create('submission', {
        status: ENUMS.SUBMISSION_STATUS.VALIDATING,
        ...payload,
      });

      return store.push(store.normalize('submission', submission.toJSON()));
    };

    this.setProperties({
      createSubmission,
      store,
    });
  });

  test.each(
    'it renders submission details',
    [
      { viaLink: true, platform: ENUMS.PLATFORM.ANDROID },
      { viaLink: true, platform: ENUMS.PLATFORM.IOS },
      { viaLink: false },
    ],
    async function (assert, { viaLink, platform }) {
      const submission = this.createSubmission({
        url: viaLink ? faker.internet.url : '',
      });

      if (platform) {
        submission.appData.platform = platform;
      }
      const submissionSet = new Set();

      this.set('submission', submission);
      this.set('submissionSet', submissionSet);

      await render(
        hbs`<UploadApp::Status::Details @submission={{this.submission}} @submissionSet={{this.submissionSet}}/>`
      );

      if (viaLink) {
        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceIcon]')
          .exists();

        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]')
          .hasText(t('viaLink'));
      } else {
        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceIcon]')
          .exists();

        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]')
          .hasText(t('viaSystem'));
      }

      // default createSubmission is in progress
      assert.dom('[data-test-uploadAppStatusDetails-statusIcon]').exists();

      assert
        .dom('[data-test-uploadAppStatusDetails-statusLabel]')
        .hasText(t('inProgress'));

      assert
        .dom('[data-test-uploadAppStatusDetails-appIcon]')
        .exists()
        .hasAttribute('src', this.submission.appData.icon_url);

      assert
        .dom('[data-test-uploadAppStatusDetails-appName]')
        .hasText(this.submission.appData.name);

      assert
        .dom('[data-test-uploadAppStatusDetails-appPackageName]')
        .hasText(this.submission.appData.package_name);

      // in progress so loader should be present
      assert
        .dom('[data-test-uploadAppStatusDetails-statusHumanized]')
        .hasText(`${this.submission.statusHumanized}...`);

      assert.dom('[data-test-uploadAppStatusDetails-progress]').hasAnyText();
      assert.dom('[data-test-uploadAppStatusDetails-linearLoader]').exists();

      assert
        .dom('[data-test-uploadAppStatusDetails-createdOn]')
        .hasText(dayjs(this.submission.createdOn).fromNow());

      if (viaLink) {
        if (this.submission.isIos) {
          assert
            .dom('[data-test-uploadAppStatusDetails-appStoreLogo]')
            .exists();
        }

        if (this.submission.isAndroid) {
          assert
            .dom('[data-test-uploadAppStatusDetails-playStoreLogo]')
            .exists();
        }

        assert
          .dom('[data-test-uploadAppStatusDetails-storeLink]')
          .hasAttribute('href', this.submission.url)
          .hasText(t('viewStoreLink'));
      } else {
        assert
          .dom('[data-test-uploadAppStatusDetails-appStoreLogo]')
          .doesNotExist();

        assert
          .dom('[data-test-uploadAppStatusDetails-playStoreLogo]')
          .doesNotExist();

        assert
          .dom('[data-test-uploadAppStatusDetails-storeLink]')
          .doesNotExist();
      }
    }
  );

  test.each(
    'test skeleton loader in submission details',
    [true, false],
    async function (assert, viaLink) {
      const submission = this.createSubmission({
        url: viaLink ? faker.internet.url : '',
        app_data: null,
      });
      const submissionSet = new Set();

      this.set('submission', submission);
      this.set('submissionSet', submissionSet);

      await render(
        hbs`<UploadApp::Status::Details @submission={{this.submission}} @submissionSet={{this.submissionSet}} />`
      );

      if (viaLink) {
        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceIcon]')
          .exists();

        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]')
          .hasText(t('viaLink'));
      } else {
        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceIcon]')
          .exists();

        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]')
          .hasText(t('viaSystem'));
      }

      // skeleton loader
      assert.dom('[data-test-uploadAppStatusDetails-appIconSkeleton]').exists();
      assert.dom('[data-test-uploadAppStatusDetails-appNameSkeleton]').exists();

      assert
        .dom('[data-test-uploadAppStatusDetails-appPackageNameSkeleton]')
        .exists();

      // app data
      assert.dom('[data-test-uploadAppStatusDetails-appIcon]').doesNotExist();
      assert.dom('[data-test-uploadAppStatusDetails-appName]').doesNotExist();

      assert
        .dom('[data-test-uploadAppStatusDetails-appPackageName]')
        .doesNotExist();
    }
  );

  test.each(
    'test submission details status failed/completed',
    [
      ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.ANALYZING, // completed
    ],
    async function (assert, status) {
      const submission = this.createSubmission({ status });
      const completed = status === ENUMS.SUBMISSION_STATUS.ANALYZING;
      const submissionSet = new Set();

      this.set('submission', submission);
      this.set('submissionSet', submissionSet);

      await render(
        hbs`<UploadApp::Status::Details @submission={{this.submission}} @submissionSet={{this.submissionSet}} />`
      );

      if (this.submission.viaLink) {
        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceIcon]')
          .exists();

        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]')
          .hasText(t('viaLink'));
      } else {
        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceIcon]')
          .exists();

        assert
          .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]')
          .hasText(t('viaSystem'));
      }

      assert.dom('[data-test-uploadAppStatusDetails-statusIcon]').exists();

      if (completed) {
        assert
          .dom('[data-test-uploadAppStatusDetails-statusLabel]')
          .hasText(t('completed'));
      } else {
        assert
          .dom('[data-test-uploadAppStatusDetails-statusLabel]')
          .hasText(t('failed'));
      }

      assert
        .dom('[data-test-uploadAppStatusDetails-appIcon]')
        .exists()
        .hasAttribute('src', this.submission.appData.icon_url);

      assert
        .dom('[data-test-uploadAppStatusDetails-appName]')
        .hasText(this.submission.appData.name);

      assert
        .dom('[data-test-uploadAppStatusDetails-appPackageName]')
        .hasText(this.submission.appData.package_name);

      // progress loader should not be present
      assert
        .dom('[data-test-uploadAppStatusDetails-statusHumanized]')
        .doesNotExist();

      assert.dom('[data-test-uploadAppStatusDetails-progress]').doesNotExist();

      assert
        .dom('[data-test-uploadAppStatusDetails-linearLoader]')
        .doesNotExist();

      if (completed) {
        assert
          .dom('[data-test-uploadAppStatusDetails-failedStatusHumanized]')
          .doesNotExist();

        assert
          .dom('[data-test-uploadAppStatusDetails-failedReason]')
          .doesNotExist();
      } else {
        // failed message
        assert
          .dom('[data-test-uploadAppStatusDetails-failedStatusHumanized]')
          .hasText(this.submission.statusHumanized);

        assert
          .dom('[data-test-uploadAppStatusDetails-failedReason]')
          .hasText(this.submission.reason);
      }
    }
  );
});
