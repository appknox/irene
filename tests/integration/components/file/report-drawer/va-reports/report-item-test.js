import { faker } from '@faker-js/faker';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
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

module(
  'Integration | Component | file/report-drawer/va-reports/report-item',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:browser/window', WindowStub);

      this.store = this.owner.lookup('service:store');
      this.fileReport = this.store.createRecord('file-report', {
        progress: 100,
        generatedOn: faker.date.past(),
      });
    });

    test('it renders a completely generated report type', async function (assert) {
      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'primary text',
        secondaryText: 'secondary text',
        iconComponent: 'ak-svg/pdf-report',
        copyText: 'pdfPassword',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(hbs`
        <File::ReportDrawer::VaReports::ReportItem   
          @reportDetails={{this.reportDetails}}
          @fileReport={{this.fileReport}} 
        />
      `);

      assert.dom('[data-test-fileVaReports-reportListItem]').exists();

      assert.dom('[data-test-vaReportListItem-leftIcon]').exists();

      assert
        .dom('[data-test-vaReportListItem-primaryText]')
        .exists()
        .hasText(this.reportDetails.primaryText);

      assert
        .dom('[data-test-vaReportListItem-secondaryText]')
        .exists()
        .hasText(this.reportDetails.secondaryText);

      assert
        .dom('[data-test-vaReportListItem-generatedOnDateTime]')
        .exists()
        .hasText(this.fileReport.generatedOnDateTime);

      assert.dom('[data-test-vaReportListItem-generatingText]').doesNotExist();

      assert
        .dom('[data-test-vaReportListItem-passCopyBtn]')
        .isNotDisabled()
        .hasAttribute('data-clipboard-text', this.reportDetails.copyText);

      assert
        .dom('[data-test-vaReportListItem-reportDownloadBtn]')
        .isNotDisabled();

      assert
        .dom('[data-test-vaReportListItem-reportDownloadBtn-icon]')
        .exists();

      assert
        .dom('[data-test-vaReportListItem-reportDownloadBtn-loadingIcon]')
        .doesNotExist();
    });

    test('it renders a pdf report type whose status is generating', async function (assert) {
      this.fileReport.progress = 50;

      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'primary text',
        secondaryText: 'secondary text',
        iconComponent: 'ak-svg/pdf-report',
        copyText: 'pdfPassword',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(hbs`
        <File::ReportDrawer::VaReports::ReportItem   
          @reportDetails={{this.reportDetails}}
          @fileReport={{this.fileReport}} 
        />
      `);

      assert.dom('[data-test-fileVaReports-reportListItem]').exists();

      assert.dom('[data-test-vaReportListItem-leftIcon]').exists();

      assert
        .dom('[data-test-vaReportListItem-primaryText]')
        .exists()
        .hasText(this.reportDetails.primaryText);

      assert
        .dom('[data-test-vaReportListItem-generatedOnDateTime]')
        .exists()
        .hasText(this.fileReport.generatedOnDateTime);

      assert.dom('[data-test-vaReportListItem-secondaryText]').doesNotExist();

      assert
        .dom('[data-test-vaReportListItem-generatingText]')
        .exists()
        .hasText(`${t('generating')}...`);

      assert.dom('[data-test-vaReportListItem-passCopyBtn]').doesNotExist();

      assert
        .dom('[data-test-vaReportListItem-reportDownloadBtn]')
        .doesNotExist();
    });

    test('it copies report password successfully', async function (assert) {
      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'primary text',
        secondaryText: 'secondary text',
        iconComponent: 'ak-svg/pdf-report',
        copyText: 'pdfPassword',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(hbs`
        <File::ReportDrawer::VaReports::ReportItem   
          @reportDetails={{this.reportDetails}}
          @fileReport={{this.fileReport}} 
        />
      `);

      assert
        .dom('[data-test-vaReportListItem-passCopyBtn]')
        .isNotDisabled()
        .hasAttribute('data-clipboard-text', this.reportDetails.copyText);

      await click('[data-test-vaReportListItem-passCopyBtn]');

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifyService.infoMsg,
        t('passwordCopied'),
        'triggers copy notification'
      );
    });

    test.each(
      'test pdf and summary reports download',
      [
        ['pdf', 'pdf', 'ak-svg/pdf-report'],
        ['csv', 'summary_csv', 'ak-svg/csv-icon'],
        ['xlsx', 'summary_excel', 'ak-svg/xlsx-icon'],
      ],
      async function (assert, [type, endpointSuffix, iconComponent]) {
        this.server.get(`/v2/reports/:reportId/${endpointSuffix}`, () => {
          return { url: `${type}_download_url.com` };
        });

        this.set('reportDetails', {
          type,
          iconComponent,
          fileReport: this.fileReport,
          primaryText: `${type} primary text`,
          secondaryText: 'secondary text',
          generatedOnDateTime: this.fileReport.generatedOnDateTime,
        });

        await render(hbs`
        <File::ReportDrawer::VaReports::ReportItem   
          @reportDetails={{this.reportDetails}}
          @fileReport={{this.fileReport}} 
        />
      `);

        assert.dom('[data-test-fileVaReports-reportListItem]').exists();

        assert
          .dom('[data-test-vaReportListItem-reportDownloadBtn]')
          .isNotDisabled();

        await click('[data-test-vaReportListItem-reportDownloadBtn]');

        const window = this.owner.lookup('service:browser/window');

        assert.strictEqual(
          window.url,
          `${type}_download_url.com`,
          `opens the right ${type} url`
        );
        assert.strictEqual(window.target, '_blank');
      }
    );

    test('it displays an error notification if download url is not found', async function (assert) {
      this.server.get(`/v2/reports/:reportId/pdf`, () => {
        return { url: null };
      });

      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'primary text',
        secondaryText: 'secondary text',
        iconComponent: 'ak-svg/pdf-report',
        copyText: 'pdfPassword',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(hbs`
        <File::ReportDrawer::VaReports::ReportItem   
          @reportDetails={{this.reportDetails}}
          @fileReport={{this.fileReport}} 
        />
      `);

      assert.dom('[data-test-fileVaReports-reportListItem]').exists();

      assert
        .dom('[data-test-vaReportListItem-reportDownloadBtn]')
        .isNotDisabled();

      await click('[data-test-vaReportListItem-reportDownloadBtn]');

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(notifyService.errorMsg, t('downloadUrlNotFound'));
    });
  }
);
