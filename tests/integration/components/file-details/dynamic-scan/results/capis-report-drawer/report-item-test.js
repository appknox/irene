import { faker } from '@faker-js/faker';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

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
  'Integration | Component | file-details/dynamic-scan/results/capis-report-drawer/report-item',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:browser/window', WindowStub);

      const store = this.owner.lookup('service:store');
      const file = store.createRecord('file');

      const capiReport = this.server.create('file-capi-report', {
        file: file.id,
        is_outdated: false,
        generated_on: faker.date.recent().toString(),
        status: ENUMS.FILE_CAPI_REPORT_STATUS.COMPLETED,
      });

      const capiReportModel = store.push(
        store.normalize('file-capi-report', capiReport.toJSON())
      );

      const capiReportDetails = {
        capiReport: capiReportModel,
        type: capiReportModel.fileType,
        primaryText: 'primary text',
        secondaryText: 'secondary text',
        iconComponent: `ak-svg/${capiReportModel.fileType}-report`,
        generatedOnDateTime: capiReportModel.generatedOnDateTime,
      };

      this.setProperties({
        file,
        store,
        capiReport: capiReportModel,
        capiReportDetails,
      });
    });

    // Check report item details
    const checkReportItemDetails = (assert, capiReportDetails) => {
      assert
        .dom(
          `[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-icon='${capiReportDetails.type}']`
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-primaryText]'
        )
        .exists()
        .hasText(capiReportDetails.primaryText);

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-generatedOnDateTime]'
        )
        .exists()
        .hasText(capiReportDetails.generatedOnDateTime);
    };

    test.each(
      'it renders a completely generated report type',
      [
        { type: 'har', primaryText: () => t('apiScanModule.harFile') },
        { type: 'json', primaryText: () => t('apiScanModule.jsonFile') },
      ],
      async function (assert, { type, primaryText }) {
        const capiReport = this.server.create('file-capi-report', {
          file: this.file.id,
          progress: 100,
          is_outdated: false,
          generated_on: faker.date.recent().toString(),
          file_type: type,
          status: ENUMS.FILE_CAPI_REPORT_STATUS.COMPLETED,
        });

        this.fileCapiReport = this.store.push(
          this.store.normalize('file-capi-report', capiReport.toJSON())
        );

        this.set('capiReportDetails', {
          capiReport: this.fileCapiReport,
          type,
          primaryText: primaryText(),
          secondaryText: t('noPasswordRequired'),
          iconComponent: `ak-svg/${type}-report`,
          generatedOnDateTime: this.fileCapiReport.generatedOnDateTime,
        });

        await render(hbs`
          <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
            @file={{this.file}}
            @capiReport={{this.fileCapiReport}}
            @reportDetails={{this.capiReportDetails}}
            @updateLatestReport={{this.updateLatestReport}}
          />
        `);

        // Check report item details
        checkReportItemDetails(assert, this.capiReportDetails);

        // Check generating text
        assert
          .dom(
            '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-generatingText]'
          )
          .doesNotExist();

        // Check download button
        assert
          .dom(
            '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-downloadBtn]'
          )
          .isNotDisabled();

        // Check download button icon
        assert
          .dom(
            '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-downloadBtn-icon]'
          )
          .exists();
      }
    );

    test('it renders a report whose status is generating', async function (assert) {
      assert.expect(9);

      this.capiReport.progress = 50;
      this.capiReport.status = ENUMS.FILE_CAPI_REPORT_STATUS.IN_PROGRESS;

      this.set('capiReportDetails', {
        ...this.capiReportDetails,
        capiReport: this.capiReport,
      });

      await render(hbs`
        <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
          @file={{this.file}}
          @capiReport={{this.capiReport}}
          @reportDetails={{this.capiReportDetails}}
          @updateLatestReport={{this.updateLatestReport}}
        />
      `);

      // Check report item details
      checkReportItemDetails(assert, this.capiReportDetails);

      // Check secondary text
      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-secondaryText]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-generatingText]'
        )
        .hasText(t('generating') + '...');

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-passCopyBtn]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-reportDownloadBtn]'
        )
        .doesNotExist();
    });

    test.each(
      'test har and json reports download',
      ['har', 'json'],
      async function (assert, type) {
        this.server.get(`/v2/capi_reports/:id/download`, () => {
          return { url: `${type}_download_url.com` };
        });

        this.set('capiReportDetails', {
          capiReport: this.capiReport,
          type,
          iconComponent: `ak-svg/${type}-report`,
          primaryText: `${type} primary text`,
          secondaryText: 'secondary text',
          generatedOnDateTime: this.capiReport.generatedOnDateTime,
        });

        await render(hbs`
          <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
            @file={{this.file}}
            @capiReport={{this.capiReport}}
            @reportDetails={{this.capiReportDetails}}
            @updateLatestReport={{this.updateLatestReport}}
          />
        `);

        assert
          .dom(
            `[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-icon='${type}']`
          )
          .exists();

        assert
          .dom(
            '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-downloadBtn]'
          )
          .isNotDisabled();

        await click(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-downloadBtn]'
        );

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
      this.server.get(`/v2/capi_reports/:id/download`, () => ({ url: null }));

      await render(hbs`
        <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
          @file={{this.file}}
          @capiReport={{this.capiReport}}
          @reportDetails={{this.capiReportDetails}}
          @updateLatestReport={{this.updateLatestReport}}
        />
      `);

      const downloadBtn =
        '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-downloadBtn]';

      assert.dom(downloadBtn).isNotDisabled();

      await click(downloadBtn);

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(notifyService.errorMsg, t('downloadUrlNotFound'));
    });

    // Check regenerate report elements
    const checkRegenerateReportElements = (
      assert,
      capiReportDetails,
      regenerateMessage
    ) => {
      // Should show regenerate text
      compareInnerHTMLWithIntlTranslation(assert, {
        selector: `[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-regenerateText='${capiReportDetails.type}']`,
        message: regenerateMessage,
      });

      // Disable download button
      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-downloadBtn]'
        )
        .isDisabled();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-regenerateBtn]'
        )
        .isNotDisabled();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-regenerateBtn-icon]'
        )
        .exists();
    };

    test('it displays an error message if report generation fails', async function (assert) {
      assert.expect(4);

      this.capiReport.status = ENUMS.FILE_CAPI_REPORT_STATUS.FAILED;

      this.set('capiReportDetails', {
        ...this.capiReportDetails,
        reportGenerationFailed: this.capiReport.reportGenerationFailed,
        capiReport: this.capiReport,
      });

      await render(hbs`
        <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
          @file={{this.file}}
          @capiReport={{this.capiReport}}
          @reportDetails={{this.capiReportDetails}}
          @updateLatestReport={{this.updateLatestReport}}
        />
      `);

      checkRegenerateReportElements(
        assert,
        this.capiReportDetails,
        t('apiScanModule.reportGenerationFailed', {
          reportType: this.capiReportDetails.primaryText,
        })
      );
    });

    test('it displays an error message if report is outdated', async function (assert) {
      assert.expect(4);

      this.capiReport.isOutdated = true;

      this.set('capiReportDetails', {
        ...this.capiReportDetails,
        isOutdated: this.capiReport.isOutdated,
        capiReport: this.capiReport,
      });

      await render(hbs`
        <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
          @file={{this.file}}
          @capiReport={{this.capiReport}}
          @reportDetails={{this.capiReportDetails}}
          @updateLatestReport={{this.updateLatestReport}}
        />
      `);

      checkRegenerateReportElements(
        assert,
        this.capiReportDetails,
        t('apiScanModule.reportRegenerateText', {
          reportType: this.capiReportDetails.primaryText,
        })
      );
    });

    test.each(
      'it regenerates a report and updates the latest report',
      [
        ['har', { outdated: true }],
        ['json', { outdated: true }],
        ['har', { generate_failed: true }],
        ['json', { generate_failed: true }],
      ],
      async function (assert, [type, { outdated, generate_failed }]) {
        assert.expect(11);

        // Update the isOutdated flag
        if (outdated) {
          this.capiReport.isOutdated = true;
        }

        // Update the status to failed
        if (generate_failed) {
          this.capiReport.status = ENUMS.FILE_CAPI_REPORT_STATUS.FAILED;
        }

        // Callback to update the latest report
        this.set('updateLatestReport', (report) => {
          this.capiReport = report;

          const newCapiReportDetails = {
            capiReport: report,
            type: report.fileType,
            primaryText: 'new primary text',
            secondaryText: 'new secondary text',
            iconComponent: `ak-svg/${report.fileType}-report`,
            generatedOnDateTime: report.generatedOnDateTime,
          };

          this.set('capiReportDetails', newCapiReportDetails);
          this.set('newCapiReportDetails', newCapiReportDetails);
          this.set('newCapiReport', report);
        });

        this.set('capiReportDetails', {
          ...this.capiReportDetails,
          type,
          isOutdated: this.capiReport.isOutdated,
          reportGenerationFailed: this.capiReport.reportGenerationFailed,
          capiReport: this.capiReport,
        });

        // Server mocks
        this.server.post(`v2/files/:id/capi_reports/${type}`, (schema, req) => {
          const fileId = req.params.id;

          const newReport = this.server.create('file-capi-report', {
            file: fileId,
            file_type: type,
            status: ENUMS.FILE_CAPI_REPORT_STATUS.COMPLETED,
            is_outdated: false,
            generated_on: faker.date.recent().toString(),
            created_on: faker.date.recent().toString(),
          });

          return newReport.toJSON();
        });

        await render(hbs`
          <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
            @file={{this.file}}
            @capiReport={{this.capiReport}}
            @reportDetails={{this.capiReportDetails}}
            @updateLatestReport={{this.updateLatestReport}}
          />
        `);

        const regenerateMessage = t(
          generate_failed
            ? 'apiScanModule.reportGenerationFailed'
            : 'apiScanModule.reportRegenerateText',
          { reportType: this.capiReportDetails.primaryText }
        );

        // Check that the regenerate text is displayed
        checkRegenerateReportElements(
          assert,
          this.capiReportDetails,
          regenerateMessage
        );

        // Click the regenerate button
        const regenerateBtn =
          '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-regenerateBtn]';

        assert.dom(regenerateBtn).isNotDisabled();
        await click(regenerateBtn);

        // Similate rerender
        await render(hbs`
          <FileDetails::DynamicScan::Results::CapisReportDrawer::ReportItem
            @file={{this.file}}
            @capiReport={{this.capiReport}}
            @reportDetails={{this.capiReportDetails}}
            @updateLatestReport={{this.updateLatestReport}}
          />
        `);

        assert.dom(regenerateBtn).doesNotExist();

        // Check report item details
        checkReportItemDetails(assert, this.newCapiReportDetails);
      }
    );
  }
);
