import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
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

// ─── Selectors ───
const selectors = {
  root: '[data-test-legacyCvssReportListItem]',
  leftIcon: '[data-test-legacyCvssReportListItem-leftIcon]',
  primaryText: '[data-test-legacyCvssReportListItem-primaryText]',
  secondaryText: '[data-test-legacyCvssReportListItem-secondaryText]',
  generatingText: '[data-test-legacyCvssReportListItem-generatingText]',
  passCopyBtn: '[data-test-legacyCvssReportListItem-passCopyBtn]',
  downloadBtn: '[data-test-legacyCvssReportListItem-reportDownloadBtn]',
  downloadIcon: '[data-test-legacyCvssReportListItem-reportDownloadBtn-icon]',

  downloadLoadingIcon:
    '[data-test-legacyCvssReportListItem-reportDownloadBtn-loadingIcon]',

  generatedOnDateTime:
    '[data-test-legacyCvssReportListItem-generatedOnDateTime]',
};

// ─── Template ───
const TEMPLATE = hbs`
  <File::ReportDrawer::LegacyCvssReports::ReportItem
    @reportDetails={{this.reportDetails}}
    @fileReport={{this.fileReport}}
  />
`;

module(
  'Integration | Component | file/report-drawer/legacy-cvss-reports/report-item',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:browser/window', WindowStub);

      this.store = this.owner.lookup('service:store');

      const record = this.server.create('file-legacy-cvss-report', {
        progress: 100,
      });

      this.fileReport = this.store.push(
        this.store.normalize('file-legacy-cvss-report', record.toJSON())
      );
    });

    // ─── Render: generated PDF ──────────────────────────────────────────────

    test('renders a fully generated pdf report item', async function (assert) {
      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'Detailed Report (pdf)',
        secondaryText: 'Report Password',
        iconComponent: 'ak-svg/pdf-report',
        copyText: 'testpwd',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.leftIcon).exists();

      assert
        .dom(selectors.primaryText)
        .containsText(this.reportDetails.primaryText);

      assert
        .dom(selectors.secondaryText)
        .containsText(this.reportDetails.secondaryText);

      assert
        .dom(selectors.generatedOnDateTime)
        .containsText(this.fileReport.generatedOnDateTime);

      assert.dom(selectors.generatingText).doesNotExist();

      assert
        .dom(selectors.passCopyBtn)
        .isNotDisabled()
        .hasAttribute('data-clipboard-text', this.reportDetails.copyText);

      assert.dom(selectors.downloadBtn).isNotDisabled();
      assert.dom(selectors.downloadIcon).exists();
      assert.dom(selectors.downloadLoadingIcon).doesNotExist();
    });

    // ─── Render: generating PDF ─────────────────────────────────────────────

    test('renders generating text and hides the download button for a pdf report in progress', async function (assert) {
      this.fileReport.progress = 50;

      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'Detailed Report (pdf)',
        secondaryText: 'Report Password',
        iconComponent: 'ak-svg/pdf-report',
        copyText: 'testpwd',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();

      assert
        .dom(selectors.primaryText)
        .containsText(this.reportDetails.primaryText);

      assert
        .dom(selectors.generatingText)
        .containsText(`${t('generating')}...`);

      assert.dom(selectors.secondaryText).doesNotExist();
      assert.dom(selectors.passCopyBtn).doesNotExist();
      assert.dom(selectors.downloadBtn).doesNotExist();
    });

    // ─── Render: summary reports (xlsx / csv) ───────────────────────────────

    test.each(
      'renders summary report items (xlsx, csv) with download button regardless of progress',
      [
        ['xlsx', 'ak-svg/xlsx-icon'],
        ['csv', 'ak-svg/csv-icon'],
      ],
      async function (assert, [type, iconComponent]) {
        this.fileReport.progress = 50;

        this.set('reportDetails', {
          fileReport: this.fileReport,
          type,
          primaryText: `Summary Report (${type})`,
          secondaryText: t('noPasswordRequired'),
          iconComponent,
          generatedOnDateTime: this.fileReport.generatedOnDateTime,
        });

        await render(TEMPLATE);

        assert.dom(selectors.root).exists();

        assert
          .dom(selectors.primaryText)
          .containsText(`Summary Report (${type})`);

        assert
          .dom(selectors.secondaryText)
          .containsText(t('noPasswordRequired'));

        assert.dom(selectors.generatingText).doesNotExist();
        assert.dom(selectors.downloadBtn).isNotDisabled();
      }
    );

    // ─── Copy button ────────────────────────────────────────────────────────

    test('shows the copy button only when copyText is provided', async function (assert) {
      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'Detailed Report (pdf)',
        secondaryText: 'Report Password',
        iconComponent: 'ak-svg/pdf-report',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
        // no copyText
      });

      await render(TEMPLATE);

      assert.dom(selectors.passCopyBtn).doesNotExist();
    });

    test('fires an info notification on successful password copy', async function (assert) {
      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'Detailed Report (pdf)',
        secondaryText: 'Report Password',
        iconComponent: 'ak-svg/pdf-report',
        copyText: 'testpwd',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.passCopyBtn)
        .hasAttribute('data-clipboard-text', 'testpwd');

      await click(selectors.passCopyBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.infoMsg,
        t('passwordCopied'),
        'shows password copied info notification'
      );
    });

    // ─── Download: success and error paths ──────────────────────────────────

    test.each(
      'downloads pdf, xlsx, and csv reports by opening the correct URL',
      [
        ['pdf', 'pdf'],
        ['xlsx', 'summary_excel'],
        ['csv', 'summary_csv'],
      ],
      async function (assert, [type, endpointSuffix]) {
        const downloadUrl = `https://example.com/${type}-report`;

        this.server.get(
          `/v2/legacy_cvss_reports/:reportId/${endpointSuffix}`,
          () => ({ url: downloadUrl })
        );

        this.set('reportDetails', {
          fileReport: this.fileReport,
          type,
          primaryText: `Report (${type})`,
          secondaryText: 'No Password Required',
          iconComponent: 'ak-svg/pdf-report',
          generatedOnDateTime: this.fileReport.generatedOnDateTime,
        });

        await render(TEMPLATE);

        assert.dom(selectors.downloadBtn).isNotDisabled();

        await click(selectors.downloadBtn);

        const window = this.owner.lookup('service:browser/window');

        assert.strictEqual(
          window.url,
          downloadUrl,
          `opens the correct download url for ${type}`
        );

        assert.strictEqual(window.target, '_blank');
      }
    );

    test('shows an error notification when the download url is missing', async function (assert) {
      this.server.get('/v2/legacy_cvss_reports/:reportId/pdf', () => ({
        url: null,
      }));

      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'Detailed Report (pdf)',
        secondaryText: 'Report Password',
        iconComponent: 'ak-svg/pdf-report',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(TEMPLATE);

      await click(selectors.downloadBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        t('downloadUrlNotFound'),
        'shows download url not found error'
      );
    });

    test('shows an error notification when the download request fails', async function (assert) {
      this.server.get(
        '/v2/legacy_cvss_reports/:reportId/pdf',
        () => new Response(500)
      );

      this.set('reportDetails', {
        fileReport: this.fileReport,
        type: 'pdf',
        primaryText: 'Detailed Report (pdf)',
        secondaryText: 'Report Password',
        iconComponent: 'ak-svg/pdf-report',
        generatedOnDateTime: this.fileReport.generatedOnDateTime,
      });

      await render(TEMPLATE);

      await click(selectors.downloadBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        t('reportIsGettingGenerated'),
        'shows error notification on download failure'
      );
    });
  }
);
