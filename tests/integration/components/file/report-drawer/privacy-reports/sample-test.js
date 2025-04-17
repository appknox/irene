import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

class NotificationsStub extends Service {
  errorMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
}

class WindowStub extends Service {
  url = null;
  target = null;

  localStorage = {
    storage: new Map(),

    getItem(key) {
      return this.storage.get(key) ?? null;
    },

    setItem(key, value) {
      this.storage.set(key, value);
    },

    clear() {
      this.storage.clear();
    },
  };

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

const sampleReportList = [
  {
    type: 'pdf',
    primaryText: () => t('fileReport.samplePDFReportText'),
  },
];

module(
  'Integration | Component | file/report-drawer/privacy-reports/sample',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:browser/window', WindowStub);

      this.server.create('privacy-report', { id: 'sample' });

      this.server.get('/v2/privacy_reports/:id', (schema, req) => {
        return schema.privacyReports.find(`${req.params.id}`)?.toJSON();
      });

      this.server.post('/v2/feature_request/privacy_module', () => {
        return 200;
      });

      const window = this.owner.lookup('service:browser/window');

      window.localStorage.clear();

      this.setProperties({
        window,
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`<File::ReportDrawer::PrivacyReports::Sample />`);

      assert
        .dom('[data-test-privacyReports-contactSupportIllustration]')
        .exists();

      assert
        .dom('[data-test-privacyReports-privacySampleReportText1]')
        .exists()
        .hasText(t('fileReport.privacySampleReportText1'));

      assert
        .dom('[data-test-privacyReports-privacySampleReportText2]')
        .exists()
        .hasText(t('fileReport.privacySampleReportText2'));

      assert
        .dom('[data-test-privacyReports-contactUsButton]')
        .exists()
        .hasText(t('contactUs'));

      const sampleReports = findAll('[data-test-sampleReportItem]');

      sampleReportList.forEach((report, idx) => {
        const reportElement = sampleReports[idx];

        assert
          .dom('[data-test-sampleReportItem-reportText]', reportElement)
          .exists()
          .hasText(t('fileReport.privacySamplePDFReportText'));
      });
    });

    test('it contacts customer support on user request', async function (assert) {
      await render(hbs`<File::ReportDrawer::PrivacyReports::Sample />`);

      assert.dom('[data-test-privacyReports-contactUsButton]').exists();

      await click('[data-test-privacyReports-contactUsButton]');

      assert.strictEqual(
        this.window.localStorage.getItem('privacyRequest'),
        'true'
      );

      assert.dom('[data-test-privacyReports-contactUsButton]').doesNotExist();
      assert
        .dom('[data-test-privacyReports-contactSuccessIllustration]')
        .exists();

      assert
        .dom('[data-test-privacyReports-contactSuccessSupportText1]')
        .exists()
        .hasText(t('fileReport.privacySampleContactSuccessMsg1'));

      const sampleReports = findAll('[data-test-sampleReportItem]');

      sampleReportList.forEach((report, idx) => {
        const reportElement = sampleReports[idx];

        assert
          .dom('[data-test-sampleReportItem-reportText]', reportElement)
          .exists()
          .hasText(t('fileReport.privacySamplePDFReportText'));
      });
    });

    test('it displays an error notification on a failed customer success contact', async function (assert) {
      const errMessage = 'Not found';

      this.server.post('/v2/feature_request/privacy_module', () => {
        return new Response(400, {}, { detail: errMessage });
      });

      await render(hbs`<File::ReportDrawer::PrivacyReports::Sample />`);

      assert.dom('[data-test-privacyReports-contactUsButton]').exists();

      await click('[data-test-privacyReports-contactUsButton]');

      assert.dom('[data-test-privacyReports-contactUsButton]').exists();

      assert
        .dom('[data-test-privacyReports-contactSuccessIllustration]')
        .doesNotExist();

      assert
        .dom('[data-test-privacyReports-contactSuccessSupportText1]')
        .doesNotExist();

      assert
        .dom('[data-test-privacyReports-contactSuccessSupportText2]')
        .doesNotExist();

      const notifyService = this.owner.lookup('service:notifications');
      assert.strictEqual(notifyService.errorMsg, errMessage);
    });

    test('it downloads sample reports', async function (assert) {
      const reportDownloadURL = `pdf_download_url.com`;

      this.server.get(`v2/privacy_reports/sample/pdf/download_url`, () => {
        return { url: reportDownloadURL };
      });

      await render(hbs`<File::ReportDrawer::PrivacyReports::Sample />`);

      assert.dom('[data-test-sampleReportItem-reportDownloadBtn]').exists();

      await click('[data-test-sampleReportItem-reportDownloadBtn]');

      const window = this.owner.lookup('service:browser/window');

      assert.strictEqual(
        window.url,
        reportDownloadURL,
        `opens the right pdf url`
      );

      assert.strictEqual(window.target, '_blank');
    });

    test('it displays an error notification if no download url is found', async function (assert) {
      this.server.get(`v2/privacy_reports/sample/pdf/download_url`, () => {
        return { url: null };
      });

      await render(hbs`<File::ReportDrawer::PrivacyReports::Sample />`);

      assert.dom('[data-test-sampleReportItem-reportDownloadBtn]').exists();

      await click('[data-test-sampleReportItem-reportDownloadBtn]');

      const notifyService = this.owner.lookup('service:notifications');
      assert.strictEqual(notifyService.errorMsg, t('downloadUrlNotFound'));
    });
  }
);
