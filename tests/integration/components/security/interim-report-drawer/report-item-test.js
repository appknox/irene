import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

const INTERIM_REPORT_BASE = '/hudson-api/interim-reports';
const FILES_BASE = '/hudson-api/files';

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

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

module(
  'Integration | Component | security/interim-report-drawer/report-item',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:browser/window', WindowStub);

      const store = this.owner.lookup('service:store');

      const interimReportData = this.server.create('interim-report', {
        id: '1',
        pdf_progress: 100,
        pdf_status: 2,
        report_password: 'TESTPASS123', //NOSONAR
        generated_by: 'admin@example.com',
        created_on: new Date().toISOString(),
        interim_analysis_status: 1,
        is_visible_to_customer: false,
        language: 'en',
      });

      this.interimReport = store.push(
        store.normalize('interim-report', interimReportData.toJSON())
      );

      this.reportDetails = {
        interimReport: this.interimReport,
        fileId: '1',
        type: 'pdf',
        primaryText: 'Interim Report (pdf)',
        reportType: 'interim',
        secondaryText: `Password: ${interimReportData.report_password}`,
        iconComponent: 'ak-svg/pdf-report',
        generatedOnDateTime: new Date().toLocaleString(),
        generatedBy: interimReportData.generated_by,
      };

      this.regenerateReport = function () {};
      this.regenerateReportTaskIsRunning = false;

      // Default: can_generate returns false
      this.server.get(
        `${FILES_BASE}/:fileId/interim-reports/can_generate`,
        () => ({ can_generate: false })
      );
    });

    test('it renders a fully generated report item', async function (assert) {
      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      assert
        .dom('[data-test-securityInterimReportDrawer-reportListItem]')
        .exists();

      assert.dom('[data-test-securityInterimReportDrawer-leftIcon]').exists();

      assert
        .dom('[data-test-securityInterimReportDrawer-primaryText]')
        .exists()
        .hasText(this.reportDetails.primaryText);

      assert
        .dom('[data-test-securityInterimReportDrawer-secondaryText]')
        .exists()
        .hasText(this.reportDetails.secondaryText);

      assert
        .dom('[data-test-securityInterimReportDrawer-generatingText]')
        .doesNotExist();

      assert
        .dom('[data-test-securityInterimReportDrawer-reportDownloadBtn]')
        .exists()
        .isNotDisabled();

      assert
        .dom('[data-test-securityInterimReportDrawer-reportDownloadBtn-icon]')
        .exists();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-reportDownloadBtn-loadingIcon]'
        )
        .doesNotExist();

      assert
        .dom('[data-test-securityInterimReportDrawer-reportItem-newReportBtn]')
        .doesNotExist();
    });

    test('it renders generating state when pdfProgress is between 0 and 99', async function (assert) {
      const store = this.owner.lookup('service:store');

      const generatingReport = store.push(
        store.normalize('interim-report', {
          id: '2',
          pdf_progress: 50,
          pdf_status: 1,
          report_password: null,
          generated_by: 'admin@example.com',
          created_on: new Date().toISOString(),
          interim_analysis_status: 1,
          is_visible_to_customer: false,
          language: 'en',
        })
      );

      this.reportDetails = {
        ...this.reportDetails,
        interimReport: generatingReport,
        secondaryText: 'No password required',
      };

      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      assert
        .dom('[data-test-securityInterimReportDrawer-generatingText]')
        .exists()
        .hasText(`${t('generating')}...`);

      assert
        .dom('[data-test-securityInterimReportDrawer-secondaryText]')
        .doesNotExist();

      assert
        .dom('[data-test-securityInterimReportDrawer-reportDownloadBtn]')
        .doesNotExist();
    });

    test('it shows the regenerate button when a new report is available', async function (assert) {
      this.server.get(
        `${FILES_BASE}/:fileId/interim-reports/can_generate`,
        () => ({ can_generate: true })
      );

      let regenerateCalled = false;
      this.regenerateReport = () => (regenerateCalled = true);

      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      await waitFor(
        '[data-test-securityInterimReportDrawer-reportItem-newReportBtn]',
        { timeout: 500 }
      );

      assert
        .dom('[data-test-securityInterimReportDrawer-reportItem-newReportBtn]')
        .exists()
        .hasText('Regenerate Report');

      await click(
        '[data-test-securityInterimReportDrawer-reportItem-newReportBtn]'
      );

      assert.true(regenerateCalled, 'regenerateReport action was called');
    });

    test('it downloads the report and opens the URL in a new tab', async function (assert) {
      const downloadUrl = 'https://example.com/report.pdf';

      this.server.get(`${INTERIM_REPORT_BASE}/:id/pdf/download_url`, () => ({
        url: downloadUrl,
      }));

      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      assert
        .dom('[data-test-securityInterimReportDrawer-reportDownloadBtn]')
        .isNotDisabled();

      await click('[data-test-securityInterimReportDrawer-reportDownloadBtn]');

      const windowService = this.owner.lookup('service:browser/window');

      assert.strictEqual(windowService.url, downloadUrl, 'opens download URL');
      assert.strictEqual(windowService.target, '_blank');
    });

    test('it shows an error when the download URL is not found', async function (assert) {
      this.server.get(`${INTERIM_REPORT_BASE}/:id/pdf/download_url`, () => ({
        url: null,
      }));

      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      await click('[data-test-securityInterimReportDrawer-reportDownloadBtn]');

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifyService.errorMsg,
        t('downloadUrlNotFound'),
        'shows download URL not found error'
      );
    });

    test('it shows an error when the download request fails', async function (assert) {
      this.server.get(
        `${INTERIM_REPORT_BASE}/:id/pdf/download_url`,
        () => new Response(500, {}, { errors: ['Server error'] })
      );

      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      await click('[data-test-securityInterimReportDrawer-reportDownloadBtn]');

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifyService.errorMsg,
        t('reportIsGettingGenerated'),
        'shows generating error message on failed download'
      );
    });

    test('it opens the customer visibility confirm box when the toggle is clicked', async function (assert) {
      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      assert
        .dom('[data-test-securityInterimReportDrawer-reportItem-title]')
        .exists()
        .hasText('Enable for customer');

      assert
        .dom('[data-test-securityInterimReportDrawer-reportItem-toggle]')
        .exists();

      // Confirm box is not visible initially
      assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();

      await click(
        '[data-test-securityInterimReportDrawer-reportItem-toggle] [data-test-toggle-input]'
      );

      assert.dom('[data-test-confirmbox-confirmBtn]').exists();
    });

    test('it enables customer visibility on confirm and shows success', async function (assert) {
      this.server.post(
        `${INTERIM_REPORT_BASE}/:id/toggle_customer_visibility`,
        () => ({ success: true })
      );

      this.server.get(`${INTERIM_REPORT_BASE}/:id`, () => ({
        id: '1',
        pdf_progress: 100,
        pdf_status: 2,
        report_password: 'TESTPASS123', //NOSONAR
        generated_by: 'admin@example.com',
        created_on: new Date().toISOString(),
        interim_analysis_status: 1,
        is_visible_to_customer: true, // visibility toggled
        language: 'en',
      }));

      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      // Click toggle to open confirm box
      await click(
        '[data-test-securityInterimReportDrawer-reportItem-toggle] [data-test-toggle-input]'
      );

      assert.dom('[data-test-confirmbox-confirmBtn]').exists();

      // Confirm the toggle
      await click('[data-test-confirmbox-confirmBtn]');

      const notifyService = this.owner.lookup('service:notifications');

      assert.ok(notifyService.successMsg, 'shows success notification');
      assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
    });

    test('it reverts the toggle state when cancel is clicked in the confirm box', async function (assert) {
      await render(hbs`
        <Security::InterimReportDrawer::ReportItem
          @reportDetails={{this.reportDetails}}
          @regenerateReport={{this.regenerateReport}}
          @regenerateReportTaskIsRunning={{this.regenerateReportTaskIsRunning}}
        />
      `);

      // Initially the toggle is off (isVisibleToCustomer = false)
      const toggleInput = find(
        '[data-test-securityInterimReportDrawer-reportItem-toggle] [data-test-toggle-input]'
      );

      assert.false(toggleInput?.checked, 'toggle is unchecked initially');

      // Click toggle to open confirm box
      await click(
        '[data-test-securityInterimReportDrawer-reportItem-toggle] [data-test-toggle-input]'
      );

      assert.dom('[data-test-confirmbox-confirmBtn]').exists();

      // Cancel the toggle
      await click('[data-test-confirmbox-cancelBtn]');

      assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();

      // Toggle should be reverted to unchecked
      assert.false(toggleInput?.checked, 'toggle is reverted to unchecked');
    });
  }
);
