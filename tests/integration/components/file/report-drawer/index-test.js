import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

class RealtimeStub extends Service {
  ReportCounter = 0;
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

class ConfigurationStub extends Service {
  serverData = { enterprise: true };
}

// File report group list
const fileReportGroups = [
  {
    id: 'va-reports',
    title: () => t('fileReport.vaReports'),
  },
  {
    id: 'privacy-module-reports',
    title: () => t('fileReport.privacyReport'),
  },
  {
    id: 'sbom-reports',
    title: () => t('fileReport.sbomReports'),
  },
];

module('Integration | Component | file/report-drawer', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:realtime', RealtimeStub);
    this.owner.register('service:notifications', NotificationsStub);

    const store = this.owner.lookup('service:store');

    const file = this.server.create('file', { can_generate_report: true });
    const fileNormalized = store.normalize('file', file.toJSON());

    this.setProperties({
      onClose: function () {},
      file: store.push(fileNormalized),
    });

    this.server.get('/v2/files/:fileId/reports', () => {
      return { count: 0, next: null, previous: null, result: [] };
    });

    this.server.get('/v2/files/:id', (schema, req) =>
      schema.files.find(req.params.id)?.toJSON()
    );

    this.server.get('/v2/files/:id/sb_file', () => {
      return {
        id: null,
        file: 1,
      };
    });
  });

  test('it renders report drawer', async function (assert) {
    await render(
      hbs`<File::ReportDrawer @file={{this.file}} @open={{true}} @onClose={{this.onClose}} />`
    );

    assert.dom('[data-test-fileReportDrawer]').exists();

    assert
      .dom('[data-test-fileReportDrawer-title]')
      .exists()
      .hasText(t('downloadReport'));

    assert.dom('[data-test-fileReportDrawer-closeBtn]').exists();

    assert.dom('[data-test-fileReportDrawer-closeBtn-icon]').exists();

    assert
      .dom('[data-test-fileReportDrawer-headerText]')
      .exists()
      .hasText(t('fileReport.reportDrawerHeaderText'));

    const reportGroups = findAll('[data-test-fileReportDrawer-group]');

    assert.strictEqual(
      reportGroups.length,
      fileReportGroups.length,
      'renders the correct number of file report groups'
    );

    for (const group of fileReportGroups) {
      assert
        .dom(`[data-test-fileReportDrawer-groupItem="${group.id}"]`)
        .exists();
    }
  });

  test('it opens va reports accordion by default ', async function (assert) {
    await render(
      hbs`<File::ReportDrawer @file={{this.file}} @open={{true}} @onClose={{this.onClose}} />`
    );

    const vaReportsGroup = fileReportGroups[0];

    assert
      .dom(
        `[data-test-fileReportDrawer-groupItem="${vaReportsGroup.id}"] [data-test-ak-accordion-content-wrapper]`
      )
      .exists()
      .hasClass(/expanded/);
  });

  test('it hides sbom & privacy reports if org is an enterprise', async function (assert) {
    this.owner.register('service:configuration', ConfigurationStub);

    await render(
      hbs`<File::ReportDrawer @file={{this.file}} @open={{true}} @onClose={{this.onClose}} />`
    );

    const reportGroups = findAll('[data-test-fileReportDrawer-group]');

    assert.strictEqual(
      reportGroups.length,
      1,
      'renders the correct number of file report groups'
    );

    assert
      .dom(`[data-test-fileReportDrawer-groupItem="sbom-reports"]`)
      .doesNotExist();
  });
});
