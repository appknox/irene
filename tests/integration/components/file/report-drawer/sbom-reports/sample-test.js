import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
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

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

const sampleReportList = [
  {
    type: 'pdf',
    primaryText: 't:fileReport.samplePDFReportText:()',
  },
  {
    type: 'cyclonedx_json',
    primaryText: 't:fileReport.sampleJsonReportText:()',
  },
];

module(
  'Integration | Component | file/report-drawer/sbom-reports/sample',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:browser/window', WindowStub);

      this.server.create('sbom-report', { id: 'sample' });

      this.server.get('/v2/sb_reports/:id', (schema, req) => {
        return schema.sbomReports.find(`${req.params.id}`)?.toJSON();
      });

      this.server.post('/v2/feature_request/sbom', (schema, req) => {
        return schema.sbomReports.find(`${req.params.id}`)?.toJSON();
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`<File::ReportDrawer::SbomReports::Sample  />`);

      assert.dom('[data-test-sbomReports-contactSupportIllustration]').exists();

      assert
        .dom('[data-test-sbomReports-sbomSampleReportText1]')
        .exists()
        .hasText('t:fileReport.sbomSampleReportText1:()');

      assert
        .dom('[data-test-sbomReports-sbomSampleReportText2]')
        .exists()
        .hasText('t:fileReport.sbomSampleReportText2:()');

      assert
        .dom('[data-test-sbomReports-contactUsButton]')
        .exists()
        .hasText('t:clickHere:()');

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sampleReports]')
        .exists();

      const sampleReports = findAll('[data-test-sampleReportItem]');

      sampleReportList.forEach((report, idx) => {
        const reportElement = sampleReports[idx];

        assert
          .dom('[data-test-sampleReportItem-reportPrimaryText]', reportElement)
          .exists()
          .hasText(report.primaryText);
      });
    });

    test('it contacts customer support on user request', async function (assert) {
      await render(hbs`<File::ReportDrawer::SbomReports::Sample  />`);

      assert.dom('[data-test-sbomReports-contactUsButton]').exists();

      await click('[data-test-sbomReports-contactUsButton]');

      assert.dom('[data-test-sbomReports-contactUsButton]').doesNotExist();
      assert.dom('[data-test-sbomReports-contactSuccessIllustration]').exists();

      assert
        .dom('[data-test-sbomReports-contactSuccessSupportText1]')
        .exists()
        .hasText('t:fileReport.sbomSampleContactSuccessMsg:()');

      const sampleReports = findAll('[data-test-sampleReportItem]');

      sampleReportList.forEach((report, idx) => {
        const reportElement = sampleReports[idx];

        assert
          .dom('[data-test-sampleReportItem-reportPrimaryText]', reportElement)
          .exists()
          .hasText(report.primaryText);
      });
    });

    test('it displays an error notification on a failed customer success contact', async function (assert) {
      const errMessage = 'Not found';

      this.server.post('/v2/feature_request/sbom', () => {
        return new Response(400, {}, { detail: errMessage });
      });

      await render(hbs`<File::ReportDrawer::SbomReports::Sample  />`);

      assert.dom('[data-test-sbomReports-contactUsButton]').exists();

      await click('[data-test-sbomReports-contactUsButton]');

      assert.dom('[data-test-sbomReports-contactUsButton]').exists();

      assert
        .dom('[data-test-sbomReports-contactSuccessIllustration]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomReports-contactSuccessSupportText1]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomReports-contactSuccessSupportText2]')
        .doesNotExist();

      const notifyService = this.owner.lookup('service:notifications');
      assert.strictEqual(notifyService.errorMsg, errMessage);
    });

    test.each(
      'it downloads sample reports',
      ['pdf', 'cyclonedx_json_file'],
      async function (assert, reportType) {
        const reportDownloadURL = `${reportType}_download_url.com`;

        this.server.get(
          `v2/sb_reports/sample/${reportType}/download_url`,
          () => {
            return { url: reportDownloadURL };
          }
        );

        await render(hbs`<File::ReportDrawer::SbomReports::Sample  />`);

        await click(
          `[data-test-sampleReportItem-reportDownloadBtn='${reportType}']`
        );

        const window = this.owner.lookup('service:browser/window');

        assert.strictEqual(
          window.url,
          reportDownloadURL,
          `opens the right ${reportType} url`
        );

        assert.strictEqual(window.target, '_blank');
      }
    );

    test('it displays an error notification if no download url is found', async function (assert) {
      this.server.get(`v2/sb_reports/sample/pdf/download_url`, () => {
        return { url: null };
      });

      await render(hbs`<File::ReportDrawer::SbomReports::Sample  />`);

      assert
        .dom("[data-test-sampleReportItem-reportDownloadBtn='pdf']")
        .exists();

      await click("[data-test-sampleReportItem-reportDownloadBtn='pdf']");

      const notifyService = this.owner.lookup('service:notifications');
      assert.strictEqual(notifyService.errorMsg, 't:downloadUrlNotFound:()');
    });
  }
);
