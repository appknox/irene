import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import ENUMS from 'irene/enums';

import Service from '@ember/service';
import dayjs from 'dayjs';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

module('Integration | Component | upload-app/status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const submissions = this.server.createList('submission', 2, {
      status: ENUMS.SUBMISSION_STATUS.VALIDATING,
    });

    const store = this.owner.lookup('service:store');

    await this.owner.lookup('service:organization').load();

    this.owner.register('service:notifications', NotificationsStub);

    this.setProperties({
      submissions,
      store,
    });
  });

  test('it renders', async function (assert) {
    this.server.get('/submissions', (schema) => {
      return schema.submissions.all().models;
    });

    await render(hbs`<UploadApp::Status />`);

    assert.dom('[data-test-uploadAppStatus-loader]').exists();
    assert.dom('[data-test-uploadAppStatus-icon]').exists();
  });

  test.each(
    'test loader color',
    [
      { running: 2, completed: 0, failed: 0 },
      { running: 0, completed: 0, failed: 2 },
      { running: 2, completed: 0, failed: 1 },
      { running: 0, completed: 2, failed: 1 },
      { running: 2, completed: 2, failed: 1 },
    ],
    async function (assert, { running, completed, failed }) {
      const runningSubmissions = this.server.createList('submission', running, {
        status: ENUMS.SUBMISSION_STATUS.VALIDATING,
      });

      const completedSubmissions = this.server.createList(
        'submission',
        completed,
        {
          status: ENUMS.SUBMISSION_STATUS.ANALYZING,
        }
      );

      const failedSubmissions = this.server.createList('submission', failed, {
        status: ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      });

      this.server.get('/submissions', () => {
        return [
          ...runningSubmissions,
          ...completedSubmissions,
          ...failedSubmissions,
        ];
      });

      await render(hbs`<UploadApp::Status />`);

      // default color is red so should have no class in case of failed
      assert
        .dom('[data-test-uploadAppStatus-loader]')
        [failed > 0 ? 'hasNoClass' : 'hasClass'](/green-loader/);

      assert.dom('[data-test-uploadAppStatus-icon]').exists();
    }
  );

  test('it renders submission list popup', async function (assert) {
    this.server.get('/submissions', (schema) => {
      return schema.submissions.all().models;
    });

    await render(hbs`<UploadApp::Status />`);

    assert.dom('[data-test-uploadAppStatus-loader]').exists();
    assert.dom('[data-test-uploadAppStatus-icon]').exists();

    await click('[data-test-uploadAppStatus-icon]');

    assert.dom('[data-test-uploadAppStatusPopover-container]').exists();

    await click('[data-test-uploadAppStatus-loader]');

    assert.dom('[data-test-uploadAppStatusPopover-container]').exists();

    const popoverContainer = find(
      '[data-test-uploadAppStatusPopover-container]'
    );

    assert
      .dom('[data-test-uploadAppStatusPopover-title]', popoverContainer)
      .hasText(t('uploadStatus'));

    // default 2 in progress submissions created
    assert
      .dom('[data-test-uploadAppStatus-submissionCount="running"]')
      .hasText('02');

    assert
      .dom('[data-test-uploadAppStatus-submissionCount="completed"]')
      .hasText('00');

    assert
      .dom('[data-test-uploadAppStatus-submissionCount="failed"]')
      .hasText('00');

    const submissionDetails = findAll('[data-test-uploadAppStatus-submission]');

    assert.strictEqual(submissionDetails.length, this.submissions.length);

    // sorting submission in descending order
    const sortedSubmissions = [...this.submissions];

    sortedSubmissions.sort((a, b) =>
      dayjs(b.created_on).diff(dayjs(a.created_on))
    );

    const submission = this.store.peekRecord(
      'submission',
      sortedSubmissions[0].id
    );

    // assert first submission detail
    if (submission.viaLink) {
      assert
        .dom(
          '[data-test-uploadAppStatusDetails-uploadSourceIcon]',
          submissionDetails[0]
        )
        .exists();

      assert
        .dom(
          '[data-test-uploadAppStatusDetails-uploadSourceTitle]',
          submissionDetails[0]
        )
        .hasText(t('viaLink'));
    } else {
      assert
        .dom(
          '[data-test-uploadAppStatusDetails-uploadSourceIcon]',
          submissionDetails[0]
        )
        .exists();

      assert
        .dom(
          '[data-test-uploadAppStatusDetails-uploadSourceTitle]',
          submissionDetails[0]
        )
        .hasText(t('viaSystem'));
    }

    // default submission is in progress
    assert
      .dom(
        '[data-test-uploadAppStatusDetails-statusIcon]',
        submissionDetails[0]
      )
      .exists();

    assert
      .dom(
        '[data-test-uploadAppStatusDetails-statusLabel]',
        submissionDetails[0]
      )
      .hasText(t('inProgress'));

    assert
      .dom('[data-test-uploadAppStatusDetails-appIcon]', submissionDetails[0])
      .exists()
      .hasAttribute('src', submission.appData.icon_url);

    assert
      .dom('[data-test-uploadAppStatusDetails-appName]', submissionDetails[0])
      .hasText(submission.appData.name);

    assert
      .dom(
        '[data-test-uploadAppStatusDetails-appPackageName]',
        submissionDetails[0]
      )
      .hasText(submission.appData.package_name);

    // in progress so loader should be present
    assert
      .dom(
        '[data-test-uploadAppStatusDetails-statusHumanized]',
        submissionDetails[0]
      )
      .hasText(`${submission.statusHumanized}...`);

    assert
      .dom('[data-test-uploadAppStatusDetails-progress]', submissionDetails[0])
      .hasAnyText();

    assert
      .dom(
        '[data-test-uploadAppStatusDetails-linearLoader]',
        submissionDetails[0]
      )
      .exists();

    assert
      .dom('[data-test-uploadAppStatusDetails-createdOn]', submissionDetails[0])
      .hasText(dayjs(submission.createdOn).fromNow());

    if (submission.viaLink) {
      if (submission.isIos) {
        assert
          .dom(
            '[data-test-uploadAppStatusDetails-appStoreLogo]',
            submissionDetails[0]
          )
          .exists();
      }

      if (submission.isAndroid) {
        assert
          .dom(
            '[data-test-uploadAppStatusDetails-playStoreLogo]',
            submissionDetails[0]
          )
          .exists();
      }

      assert
        .dom(
          '[data-test-uploadAppStatusDetails-storeLink]',
          submissionDetails[0]
        )
        .hasAttribute('href', submission.url)
        .hasText(t('viewStoreLink'));
    } else {
      assert
        .dom(
          '[data-test-uploadAppStatusDetails-appStoreLogo]',
          submissionDetails[0]
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-uploadAppStatusDetails-playStoreLogo]',
          submissionDetails[0]
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-uploadAppStatusDetails-storeLink]',
          submissionDetails[0]
        )
        .doesNotExist();
    }
  });

  test('test submission list popup status counts', async function (assert) {
    // create failed submissions
    const failedSubmissions = [
      ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED,
    ].map((status) => this.server.create('submission', { status }));

    this.server.get('/submissions', (schema) => {
      return schema.submissions.all().models;
    });

    await render(hbs`<UploadApp::Status />`);

    assert.dom('[data-test-uploadAppStatus-loader]').exists();
    assert.dom('[data-test-uploadAppStatus-icon]').exists();

    await click('[data-test-uploadAppStatus-icon]');

    assert.dom('[data-test-uploadAppStatusPopover-container]').exists();

    await click('[data-test-uploadAppStatus-loader]');

    assert.dom('[data-test-uploadAppStatusPopover-container]').exists();

    const popoverContainer = find(
      '[data-test-uploadAppStatusPopover-container]'
    );

    assert
      .dom('[data-test-uploadAppStatusPopover-title]', popoverContainer)
      .hasText(t('uploadStatus'));

    // default 2 in progress submissions created
    assert
      .dom('[data-test-uploadAppStatus-submissionCount="running"]')
      .hasText('02');

    assert
      .dom('[data-test-uploadAppStatus-submissionCount="completed"]')
      .hasText('00');

    assert
      .dom('[data-test-uploadAppStatus-submissionCount="failed"]')
      .hasText('0' + failedSubmissions.length);

    const submissionDetails = findAll('[data-test-uploadAppStatus-submission]');

    assert.strictEqual(
      submissionDetails.length,
      [...this.submissions, ...failedSubmissions].length
    );
  });
});
