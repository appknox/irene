import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { serializer } from 'irene/tests/test-utils';

class RealtimeStub extends Service {
  @tracked LegacyCVSSReportCounter = 0;
}

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

// ─── Selectors ───
const selectors = {
  root: '[data-test-fileReportDrawer-legacyCvssReports]',
  loader: '[data-test-legacyCvssReports-reportsLoader]',
  generateCTA: '[data-test-legacyCvssReports-generateReport-CTA]',
  generateCTAVector: '[data-test-legacyCvssReports-generateReportCTA-vector]',
  progressText: '[data-test-legacyCvssReports-generateReportProgress-text]',
  progressLoader: '[data-test-legacyCvssReports-generateReportProgress-loader]',
  generateBtn: '[data-test-legacyCvssReports-generateBtn]',
  reportList: '[data-test-legacyCvssReports-reportList]',
  reportItem: '[data-test-legacyCvssReports-reportList-reportItem]',

  generateCTADirectiveText:
    '[data-test-legacyCvssReports-generateReportCTA-directiveText]',

  progressContainer:
    '[data-test-legacyCvssReports-generateReportProgress-container]',

  progressPercent:
    '[data-test-legacyCvssReports-generateReportProgress-percent]',

  reportItemByType: (type) =>
    `[data-test-legacyCvssReports-reportList-Item='${type}']`,
};

// ─── Template ───
const TEMPLATE = hbs`
  <File::ReportDrawer::LegacyCvssReports
    @file={{this.file}}
    @closeDrawer={{this.closeDrawer}}
  />
`;

module(
  'Integration | Component | file/report-drawer/legacy-cvss-reports',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:realtime', RealtimeStub);
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

      const project = this.server.create('project');

      const projectRecord = store.push(
        store.normalize('project', project.toJSON())
      );

      const file = this.server.create('file', {
        project: projectRecord.id,
        is_static_done: true,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        closeDrawer: () => {},
      });

      // Default stubs — override per test as needed
      this.server.get('/v3/files/:id/can_generate_report', () => ({
        can_generate_report: true,
        can_generate_legacy_report: true,
      }));

      this.server.get('/v3/files/:id/last_automated_dynamic_scan', () => ({}));
      this.server.get('/v3/files/:id/last_manual_dynamic_scan', () => ({}));
    });

    // ─── Loading state ──────────────────────────────────────────────────────

    test('renders the loader while reports are being fetched', async function (assert) {
      this.server.get(
        '/v2/files/:fileId/legacy_cvss_reports',
        () => ({ count: 0, next: null, previous: null, results: [] }),
        { timing: 300 }
      );

      render(TEMPLATE);

      await waitFor(selectors.loader, { timeout: 300 });

      assert.dom(selectors.root).exists();
      assert.dom(selectors.loader).exists();
      assert.dom(selectors.generateCTA).doesNotExist();

      await waitFor(selectors.generateCTA, { timeout: 500 });

      assert.dom(selectors.loader).doesNotExist();
    });

    // ─── Generate CTA ───────────────────────────────────────────────────────

    test('shows the generate CTA when no reports exist and can generate', async function (assert) {
      this.server.get('/v2/files/:fileId/legacy_cvss_reports', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      await render(TEMPLATE);

      assert.dom(selectors.generateCTA).exists();
      assert.dom(selectors.generateCTAVector).exists();

      assert
        .dom(selectors.generateCTADirectiveText)
        .containsText(t('fileReport.generateReportCTAText'));

      assert.dom(selectors.generateBtn).containsText(t('generateReport'));
      assert.dom(selectors.reportList).doesNotExist();
      assert.dom(selectors.progressContainer).doesNotExist();
    });

    test('shows the generate CTA even when reports exist but can generate another', async function (assert) {
      this.server.create('file-legacy-cvss-report', {
        progress: 100,
        file_id: this.file.id,
      });

      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      await render(TEMPLATE);

      assert.dom(selectors.generateCTA).exists();
      assert.dom(selectors.reportList).exists();
    });

    test('hides the generate CTA when reports exist and cannot generate another', async function (assert) {
      this.server.get('/v3/files/:id/can_generate_report', () => ({
        can_generate_report: false,
        can_generate_legacy_report: false,
      }));

      this.server.create('file-legacy-cvss-report', {
        progress: 100,
        file_id: this.file.id,
      });

      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      await render(TEMPLATE);

      assert.dom(selectors.generateCTA).doesNotExist();
      assert.dom(selectors.reportList).exists();
    });

    // ─── Generate report actions ────────────────────────────────────────────

    test('clicking generate triggers POST and shows a success notification', async function (assert) {
      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      this.server.post('/v2/files/:fileId/legacy_cvss_reports', () => {
        this.server.create('file-legacy-cvss-report', {
          progress: 10,
          file_id: this.file.id,
        });

        return new Response(200);
      });

      await render(TEMPLATE);

      assert.dom(selectors.generateBtn).exists();

      await click(selectors.generateBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('reportIsGettingGenerated'),
        'shows success notification after generate'
      );
    });

    test('shows an error notification when the generate POST fails', async function (assert) {
      this.server.get('/v2/files/:fileId/legacy_cvss_reports', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      this.server.post(
        '/v2/files/:fileId/legacy_cvss_reports',
        () => new Response(400, {}, { detail: 'Error message' })
      );

      await render(TEMPLATE);

      await click(selectors.generateBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        'Error message',
        'shows error notification on generate failure'
      );
    });

    // ─── Report list ────────────────────────────────────────────────────────

    test('renders pdf, xlsx, and csv report items for the latest report', async function (assert) {
      this.server.get('/v3/files/:id/can_generate_report', () => ({
        can_generate_report: false,
        can_generate_legacy_report: false,
      }));

      this.server.create('file-legacy-cvss-report', {
        progress: 100,
        file_id: this.file.id,
      });

      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      await render(TEMPLATE);

      assert.dom(selectors.reportList).exists();
      assert.dom(selectors.generateCTA).doesNotExist();

      const items = findAll(selectors.reportItem);

      assert.strictEqual(
        items.length,
        3,
        'renders pdf, xlsx, and csv items for the latest report'
      );

      assert.dom(selectors.reportItemByType('pdf')).exists();
      assert.dom(selectors.reportItemByType('xlsx')).exists();
      assert.dom(selectors.reportItemByType('csv')).exists();
    });

    test('renders the progress bar when the latest report is still generating', async function (assert) {
      const fileReport = this.server.create('file-legacy-cvss-report', {
        progress: 50,
        file_id: this.file.id,
      });

      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      await render(TEMPLATE);

      assert.dom(selectors.progressContainer).exists();

      assert
        .dom(selectors.progressText)
        .containsText(t('fileReport.generateReportLoaderText'));

      assert.dom(selectors.progressLoader).exists();

      assert
        .dom(selectors.progressPercent)
        .containsText(`${fileReport.progress}%`);
    });

    test('does not render the progress bar when the latest report is complete', async function (assert) {
      this.server.create('file-legacy-cvss-report', {
        progress: 100,
        file_id: this.file.id,
      });

      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      await render(TEMPLATE);

      assert.dom(selectors.progressContainer).doesNotExist();
    });

    test('renders a previous pdf item when two reports exist', async function (assert) {
      this.server.get('/v3/files/:id/can_generate_report', () => ({
        can_generate_report: false,
        can_generate_legacy_report: false,
      }));

      this.server.createList('file-legacy-cvss-report', 2, {
        progress: 100,
        file_id: this.file.id,
      });

      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      await render(TEMPLATE);

      const items = findAll(selectors.reportItem);

      // latest: pdf + xlsx + csv, previous: pdf
      assert.strictEqual(
        items.length,
        4,
        'renders 3 latest + 1 previous pdf report item'
      );
    });

    // ─── Realtime counter → reload flow ─────────────────────────────────────

    test('bumping LegacyCVSSReportCounter reloads reports and hides the generate CTA when generation is no longer allowed', async function (assert) {
      // Schema-backed reports handler — reload picks up records created mid-test.
      this.server.get('/v2/files/:fileId/legacy_cvss_reports', (schema) =>
        serializer(schema.fileLegacyCvssReports.all(), true)
      );

      this.server.get('/v3/files/:id/can_generate_report', () => ({
        can_generate_report: true,
        can_generate_legacy_report: true,
      }));

      await render(TEMPLATE);

      // ── Pre-state: no reports, generation allowed → CTA visible
      assert.dom(selectors.generateBtn).containsText(t('generateReport'));
      assert.dom(selectors.reportList).doesNotExist();

      // Server now reports: a report exists AND generation is no longer allowed
      this.server.create('file-legacy-cvss-report', {
        progress: 100,
        file_id: this.file.id,
      });

      this.server.get('/v3/files/:id/can_generate_report', () => ({
        can_generate_report: false,
        can_generate_legacy_report: false,
      }));

      // Trigger the observer — this is what a realtime WS notification does
      const realtime = this.owner.lookup('service:realtime');
      realtime.LegacyCVSSReportCounter++;

      // Wait for the reload — report list mounts once the refetch resolves.
      // The template's outer `{{#if getReports.isRunning}}` guarantees the
      // loader is gone by the time the reportList is in the DOM.
      await waitFor(selectors.reportList, { timeout: 500 });

      // ── Post-state: CTA hidden, report list rendered with pdf/xlsx/csv items
      assert.dom(selectors.generateCTA).doesNotExist();
      assert.dom(selectors.reportItemByType('pdf')).exists();
      assert.dom(selectors.reportItemByType('xlsx')).exists();
      assert.dom(selectors.reportItemByType('csv')).exists();
    });

    test('shows an error notification and hides the report list when loading reports fails', async function (assert) {
      this.server.get(
        '/v2/files/:fileId/legacy_cvss_reports',
        () => new Response(500)
      );

      await render(TEMPLATE);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        'The backend responded with an error',
        'shows error notification on reports fetch failure'
      );

      assert.dom(selectors.reportList).doesNotExist();
    });
  }
);
