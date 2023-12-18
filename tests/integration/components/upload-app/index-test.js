import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { render, waitFor, find, findAll } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import ENUMS from 'irene/enums';

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
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

class RealtimeStub extends Service {
  @tracked SubmissionCounter = 0;
}

class ConfigurationStub extends Service {
  serverData = { urlUploadAllowed: true };
}

module('Integration | Component | upload-app', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    await this.owner.lookup('service:organization').load();

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:realtime', RealtimeStub);
    this.owner.register('service:configuration', ConfigurationStub);

    this.setProperties({
      store,
    });
  });

  test('it renders', async function (assert) {
    this.server.get('/submissions', () => {
      return [];
    });

    await render(hbs`<UploadApp />`);

    assert.dom('[data-test-uploadApp-root]').exists();

    assert.dom('[data-test-uploadApp-uploadBtn]').hasText('t:uploadApp:()');
    // assert.dom('[data-test-uploadAppViaLink-btn]').isNotDisabled();

    assert.dom('[data-test-uploadAppStatus-loader]').doesNotExist();
    assert.dom('[data-test-uploadAppStatus-icon]').doesNotExist();
  });

  test('test end to end upload via system & link', async function (assert) {
    assert.expect(30);

    const realtime = this.owner.lookup('service:realtime');
    const appLink =
      'https://play.google.com/store/apps/details?id=com.example.app';

    // to change scope of server
    const server = this.server;

    this.server.get('/organizations/:id/upload_app', () => {
      const uploadApp = server.create('uploadApp').toJSON();

      return uploadApp;
    });

    this.server.post('/organizations/:id/upload_app', () => {
      return new Response(200);
    });

    this.server.put(
      '/:id/s3_upload_file',
      () => {
        // create a new via system submission
        const submission = server.create('submission', {
          status: ENUMS.SUBMISSION_STATUS.VALIDATING,
          created_on: dayjs(Date.now()),
        });

        this.set('viaSystemSubmission', submission);

        return new Response(200);
      },
      { timing: 500 }
    );

    this.server.post('/organizations/:id/upload_app_url', (schema, req) => {
      const data = JSON.parse(req.requestBody);

      assert.strictEqual(data.url, appLink);

      // create a new via link submission
      const submission = server.create('submission', {
        status: ENUMS.SUBMISSION_STATUS.VALIDATING,
        url: data.url,
        created_on: dayjs(Date.now()),
      });

      this.set('viaLinkSubmission', submission);

      return new Response(200);
    });

    this.server.get('/submissions', (schema) => {
      return schema.submissions.all().models;
    });

    await render(hbs`<UploadApp />`);

    assert.dom('[data-test-uploadApp-root]').exists();

    assert.dom('[data-test-uploadApp-uploadBtn]').hasText('t:uploadApp:()');
    // assert.dom('[data-test-uploadAppViaLink-btn]').isNotDisabled();

    assert.dom('[data-test-uploadAppStatus-loader]').doesNotExist();
    assert.dom('[data-test-uploadAppStatus-icon]').doesNotExist();

    // await click('[data-test-uploadAppViaLink-btn]');

    // assert
    //   .dom('[data-test-ak-modal-header]')
    //   .hasText('t:uploadAppModule.linkUploadPopupHeader:()');

    // assert
    //   .dom('[data-test-uploadAppViaLinkModal-linkInput]')
    //   .isNotDisabled()
    //   .hasNoValue();

    // assert
    //   .dom('[data-test-uploadAppViaLinkModal-confirmBtn]')
    //   .isDisabled()
    //   .hasText('t:upload:()');

    // await fillIn('[data-test-uploadAppViaLinkModal-linkInput]', appLink);

    // assert.dom('[data-test-uploadAppViaLinkModal-confirmBtn]').isNotDisabled();

    // await click('[data-test-uploadAppViaLinkModal-confirmBtn]');

    // should close modal on success
    // assert.dom('[data-test-ak-modal-header]').doesNotExist();

    // trigger submission refetch
    // realtime.incrementProperty('SubmissionCounter');

    assert.dom('[data-test-uploadAppStatusPopover-container]').doesNotExist();

    const file = new File(['Test apk file'], 'test.apk', {
      type: 'application/vnd.android.package-archive',
    });

    await selectFiles('[data-test-uploadApp-root] input', file);

    // open popover
    // await click('[data-test-uploadAppStatus-loader]');

    const notify = this.owner.lookup('service:notifications');

    // TODO: add checks for via system upload while uploading

    assert.strictEqual(notify.successMsg, 't:fileUploadedSuccessfully:()');
    assert.dom('[data-test-uploadApp-uploadBtn]').hasText('t:uploadApp:()');

    // trigger submission refetch
    realtime.incrementProperty('SubmissionCounter');

    // wait for api
    await waitFor('[data-test-uploadAppStatus-loader]', { timeout: 2000 });

    // status should be visible
    assert.dom('[data-test-uploadAppStatus-loader]').exists();
    assert.dom('[data-test-uploadAppStatus-icon]').exists();

    // popover should open by default
    assert.dom('[data-test-uploadAppStatusPopover-container]').exists();

    const popoverContainer = find(
      '[data-test-uploadAppStatusPopover-container]'
    );

    assert
      .dom('[data-test-uploadAppStatusPopover-title]', popoverContainer)
      .hasText('t:uploadStatus:()');

    // 1 in progress submissions created
    assert
      .dom('[data-test-uploadAppStatus-submissionCount="running"]')
      .hasText('01');

    assert
      .dom('[data-test-uploadAppStatus-submissionCount="completed"]')
      .hasText('00');

    assert
      .dom('[data-test-uploadAppStatus-submissionCount="failed"]')
      .hasText('00');

    let submissionDetails = findAll('[data-test-uploadAppStatus-submission]');

    // there should be 1 submission
    assert.strictEqual(submissionDetails.length, 1);

    // const viaLinkSubmission = this.store.peekRecord(
    //   'submission',
    //   this.viaLinkSubmission.id
    // );

    // this.assertSubmissionDetails(
    //   assert,
    //   viaLinkSubmission,
    //   submissionDetails[0],
    //   true
    // );

    // close popover
    // await click('[data-test-ak-popover-backdrop]');

    // wait for api
    // await waitUntil(
    //   () => findAll('[data-test-uploadAppStatus-submission]').length == 2,
    //   { timeout: 2000 }
    // );

    // submissionDetails = findAll('[data-test-uploadAppStatus-submission]');

    // there should be 2 submission
    // assert.strictEqual(submissionDetails.length, 2);

    const viaSystemSubmission = this.store.peekRecord(
      'submission',
      this.viaSystemSubmission.id
    );

    this.assertSubmissionDetails(
      assert,
      viaSystemSubmission,
      submissionDetails[0],
      false
    );
  });

  this.assertSubmissionDetails = (assert, submission, container, viaLink) => {
    if (viaLink) {
      assert
        .dom('[data-test-uploadAppStatusDetails-uploadSourceIcon]', container)
        .exists();

      assert
        .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]', container)
        .hasText('t:viaLink:()');
    } else {
      assert
        .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]', container)
        .exists();

      assert
        .dom('[data-test-uploadAppStatusDetails-uploadSourceTitle]', container)
        .hasText('t:viaSystem:()');
    }

    // default is in progress
    assert
      .dom('[data-test-uploadAppStatusDetails-statusIcon]', container)
      .exists();

    assert
      .dom('[data-test-uploadAppStatusDetails-statusLabel]', container)
      .hasText('t:inProgress:()');

    assert
      .dom('[data-test-uploadAppStatusDetails-appIcon]', container)
      .exists()
      .hasAttribute('src', submission.appData.icon_url);

    assert
      .dom('[data-test-uploadAppStatusDetails-appName]', container)
      .hasText(submission.appData.name);

    assert
      .dom('[data-test-uploadAppStatusDetails-appPackageName]', container)
      .hasText(submission.appData.package_name);

    // in progress so loader should be present
    assert
      .dom('[data-test-uploadAppStatusDetails-statusHumanized]', container)
      .hasText(`${submission.statusHumanized}...`);

    assert
      .dom('[data-test-uploadAppStatusDetails-progress]', container)
      .hasAnyText();

    assert
      .dom('[data-test-uploadAppStatusDetails-linearLoader]', container)
      .exists();

    assert
      .dom('[data-test-uploadAppStatusDetails-createdOn]', container)
      .hasText(dayjs(submission.createdOn).fromNow());

    if (viaLink) {
      if (submission.isIos) {
        assert
          .dom('[data-test-uploadAppStatusDetails-appStoreLogo]', container)
          .exists();
      }

      if (submission.isAndroid) {
        assert
          .dom('[data-test-uploadAppStatusDetails-playStoreLogo]', container)
          .exists();
      }

      assert
        .dom('[data-test-uploadAppStatusDetails-storeLink]', container)
        .hasAttribute('href', submission.url)
        .hasText('t:viewStoreLink:()');
    } else {
      assert
        .dom('[data-test-uploadAppStatusDetails-appStoreLogo]', container)
        .doesNotExist();

      assert
        .dom('[data-test-uploadAppStatusDetails-playStoreLogo]', container)
        .doesNotExist();

      assert
        .dom('[data-test-uploadAppStatusDetails-storeLink]', container)
        .doesNotExist();
    }
  };
});
