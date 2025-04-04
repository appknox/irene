import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { find, findAll, render, waitFor, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

import { TrackerStatus } from 'irene/models/tracker-request';
import { DangerPermsStatus } from 'irene/models/dangerous-permission-request';
import { PrivacyReportStatus } from 'irene/models/privacy-report';
import { tracked } from '@glimmer/tracking';

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      privacy: true,
    },
  };
}

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

  localStorage = {
    storage: new Map(),

    getItem(key) {
      return this.storage.get(key) ?? null;
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

class RealtimeStub extends Service {
  @tracked PrivacyReportCounter = 0;
}

module(
  'Integration | Component | file/report-drawer/privacy-reports',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');
    setupBrowserFakes(hooks, { window: true, localStorage: true });

    hooks.beforeEach(async function () {
      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:browser/window', WindowStub);

      const store = this.owner.lookup('service:store');

      const window = this.owner.lookup('service:browser/window');

      window.localStorage.clear();

      const file = this.server.create('file', {
        id: 1,
      });

      // Tracker Request Model
      this.server.create('tracker-request', {
        id: TrackerStatus.COMPLETED,
      });

      // Danger Perms Request Model
      this.server.create('dangerous-permission-request', {
        id: 1,
      });

      this.setProperties({
        onClose: function () {},
        store,
        file,
      });

      // Server mocks
      this.server.get('/v2/privacy_projects/:id', (schema, req) => {
        return schema.privacyProjects.find(req.params.id)?.toJSON();
      });

      this.server.get('/v2/privacy_reports/:id', (schema, req) => {
        return schema.privacyReports.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/:id/privacy_report', (schema) => {
        const results = schema.privacyReports.all().models;
        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/files/:id/tracker_request', (schema, req) => {
        return { id: 2, file: 1, status: TrackerStatus.SUCCESS };
      });

      this.server.get('/v2/files/:id/permission_request', (schema, req) => {
        return { id: 2, file: 1, status: DangerPermsStatus.SUCCESS };
      });

      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:realtime', RealtimeStub);
    });

    test('it shows sample reports if org does not have privacy access', async function (assert) {
      // Privacy is inactive for org
      class OrganizationStub extends Service {
        selected = {
          id: 1,
          features: {
            privacy: false,
          },
        };
      }

      this.owner.register('service:organization', OrganizationStub);

      await render(
        hbs`<File::ReportDrawer::PrivacyReports @file={{this.file}} @closeDrawer={{@onClose}}  />`
      );

      assert.dom('[data-test-fileReportDrawer-privacyReports-root]').exists();
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
    });

    test('it shows generate button if org has access and privacy report is not generated', async function (assert) {
      render(
        hbs`<File::ReportDrawer::PrivacyReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      await waitFor('[data-test-fileReportDrawer-privacyReports-root]', {
        timeout: 500,
      });

      assert.dom('[data-test-privacyReport-loader]').exists();

      await waitFor('[data-test-privacyReport-loader]', {
        timeout: 500,
      });

      await waitFor('[data-test-privacyReport-reportlistItem]', {
        timeout: 500,
      });

      const reportList = findAll('[data-test-privacyReport-reportlistItem]');

      assert
        .dom('[data-test-privacyReport-reportGenerateSvg]', reportList[0])
        .exists();

      assert.strictEqual(
        find(
          '[data-test-privacyReport-reportGenerateDescription]'
        ).innerHTML.trim(),
        t('privacyModule.generateReportDescription', {
          htmlSafe: true,
        }).toString()
      );

      assert
        .dom('[data-test-privacyReport-reportGenerateBtn]', reportList[0])
        .isNotDisabled()
        .hasText(t('generateReport'));

      assert
        .dom('[data-test-fileReportDrawer-privacyReports-fileLink]')
        .exists()
        .hasText(t('privacyModule.title'));
    });

    test('it renders privacy pdf report if generated', async function (assert) {
      const privacyReport = this.server.create('privacy-report', {
        file: 1,
        pdf_progress: 100,
        pdf_status: PrivacyReportStatus.COMPLETED,
      });

      await render(
        hbs`<File::ReportDrawer::PrivacyReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      const reportList = findAll('[data-test-privacyReport-reportlistItem]');

      // Test for generated pdf report state
      assert
        .dom('[data-test-privacyReport-reportPrimaryText]', reportList[0])
        .hasText(t('privacyModule.downloadPdfPrimaryText'));

      assert
        .dom('[data-test-privacyReport-reportSecondaryText]', reportList[0])
        .hasText(
          t('privacyModule.downloadPdfSecondaryText', {
            password: privacyReport.report_password,
          })
        );

      assert
        .dom('[data-test-privacyReport-reportCopyBtn]', reportList[0])
        .isNotDisabled()
        .hasAttribute('data-clipboard-text', privacyReport.report_password);

      assert
        .dom('[data-test-privacyReport-reportDownloadBtn]', reportList[0])
        .isNotDisabled();
    });

    test('it renders inprogress state if privacy analyses is not ready', async function (assert) {
      this.server.get('/v2/files/:id/tracker_request', (schema, req) => {
        return { id: 2, file: 1, status: TrackerStatus.PENDING };
      });

      await render(
        hbs`<File::ReportDrawer::PrivacyReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      assert.dom('[data-test-privacyReport-reportGenerateBtn]').doesNotExist();

      assert
        .dom('[data-test-fileReportDrawer-privacyReports-pendingIllustration]')
        .doesNotExist();

      assert
        .dom('[data-test-fileReportDrawer-privacyReports-statusText]')
        .exists()
        .hasText(t('privacyModule.inProgressMessageReport'));
    });

    test('it renders failed state if privacy analyses failed', async function (assert) {
      this.server.get('/v2/files/:id/tracker_request', (schema, req) => {
        return { id: 2, file: 1, status: TrackerStatus.FAILED };
      });

      await render(
        hbs`<File::ReportDrawer::PrivacyReports @file={{this.file}} @closeDrawer={{this.onClose}} />`
      );

      assert.dom('[data-test-privacyReport-reportGenerateBtn]').doesNotExist();

      assert
        .dom('[data-test-fileReportDrawer-privacyReports-pendingIllustration]')
        .doesNotExist();

      assert
        .dom('[data-test-fileReportDrawer-privacyReports-statusText]')
        .exists()
        .hasText(t('privacyModule.failedNote'));
    });

    test('test pdf report realtime state updates', async function (assert) {
      this.setProperties({
        status: PrivacyReportStatus.PENDING,
      });

      const privacyReport = this.server.create('privacy-report', {
        pdf_status: this.status,
      });

      this.server.get('/v2/files/:id/privacy_reports', (schema) => {
        const results = schema.privacyReports.all().models;

        results[0].pdf_status = this.status;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/privacy_reports/:id', (schema, req) => {
        return {
          ...schema.privacyReports.find(`${req.params.id}`)?.toJSON(),
          pdf_status: this.status,
        };
      });

      this.server.post('/v2/privacy_reports/:id/pdf/generate', () => ({
        success: true,
      }));

      await render(hbs`
        <File::ReportDrawer::PrivacyReports @file={{this.file}} @closeDrawer={{this.onClose}} />
      `);

      let reportList = findAll('[data-test-privacyReport-reportlistItem]');

      assert
        .dom('[data-test-privacyReport-reportGenerateBtn]', reportList[0])
        .isNotDisabled()
        .hasText(t('generateReport'));

      this.set('status', PrivacyReportStatus.STARTED);

      await click(
        reportList[0].querySelector(
          '[data-test-privacyReport-reportGenerateBtn]'
        )
      );

      // refresh dom reference
      reportList = findAll('[data-test-privacyReport-reportlistItem]');

      // previous state
      assert
        .dom(
          '[data-test-privacyReport-reportGenerateDescription]',
          reportList[0]
        )
        .doesNotExist();

      assert
        .dom('[data-test-privacyReport-reportGenerateBtn]', reportList[0])
        .doesNotExist();

      // current state
      assert
        .dom('[data-test-privacyReport-reportPrimaryText]', reportList[0])
        .hasText(t('privacyModule.downloadPdfPrimaryText'));

      assert
        .dom('[data-test-privacyReport-reportGeneratingText]', reportList[0])
        .hasText(`${t('generating')}...`);

      assert
        .dom('[data-test-privacyreport-reportgeneratingloader]', reportList[0])
        .exists();

      // change status to completed and increment privacy report counter to notify
      this.set('status', PrivacyReportStatus.COMPLETED);

      const realtime = this.owner.lookup('service:realtime');
      realtime.incrementProperty('PrivacyReportCounter');

      // wait for api
      await waitFor('[data-test-privacyReport-reportCopyBtn]', {
        timeout: 200,
      });

      // refresh dom reference
      reportList = findAll('[data-test-privacyReport-reportlistItem]');

      // previous state
      assert
        .dom('[data-test-privacyReport-reportGeneratingText]', reportList[0])
        .doesNotExist();

      assert
        .dom('[data-test-privacyReport-reportGeneratingLoader]', reportList[0])
        .doesNotExist();

      // completed state
      assert
        .dom('[data-test-privacyReport-reportPrimaryText]', reportList[0])
        .hasText(t('privacyModule.downloadPdfPrimaryText'));

      assert
        .dom('[data-test-privacyReport-reportSecondaryText]', reportList[0])
        .hasText(
          t('privacyModule.downloadPdfSecondaryText', {
            password: privacyReport.report_password,
          })
        );

      assert
        .dom('[data-test-privacyReport-reportCopyBtn]', reportList[0])
        .isNotDisabled()
        .hasAttribute('data-clipboard-text', privacyReport.report_password);

      assert
        .dom('[data-test-privacyReport-reportDownloadBtn]', reportList[0])
        .isNotDisabled();
    });

    test('test pdf report download (already generated)', async function (assert) {
      const privacyReport = this.server.create('privacy-report', {
        pdf_status: PrivacyReportStatus.COMPLETED,
      });

      this.server.get('/v2/files/:id/privacy_reports', (schema) => {
        const results = schema.privacyReports.all().models;

        results[0].pdf_status = PrivacyReportStatus.COMPLETED;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/privacy_reports/:id/pdf/download_url', () => {
        return { url: 'some_pdf_download_url.com' };
      });

      await render(hbs`
        <File::ReportDrawer::PrivacyReports @file={{this.file}} @closeDrawer={{this.onClose}} />
      `);

      const reportList = findAll('[data-test-privacyReport-reportlistItem]');

      assert
        .dom('[data-test-privacyReport-reportPrimaryText]', reportList[0])
        .hasText(t('privacyModule.downloadPdfPrimaryText'));

      assert
        .dom('[data-test-privacyReport-reportSecondaryText]', reportList[0])
        .hasText(
          t('privacyModule.downloadPdfSecondaryText', {
            password: privacyReport.report_password,
          })
        );

      assert
        .dom('[data-test-privacyReport-reportCopyBtn]', reportList[0])
        .isNotDisabled()
        .hasAttribute('data-clipboard-text', privacyReport.report_password);

      assert
        .dom('[data-test-privacyReport-reportDownloadBtn]', reportList[0])
        .isNotDisabled();

      await click(
        reportList[0].querySelector(
          '[data-test-privacyReport-reportDownloadBtn]'
        )
      );

      const window = this.owner.lookup('service:browser/window');

      assert.strictEqual(window.url, 'some_pdf_download_url.com');
      assert.strictEqual(window.target, '_blank');
    });
  }
);
