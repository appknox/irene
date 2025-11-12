import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { find, findAll, render, waitFor, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

import { SbomReportStatus } from 'irene/models/sbom-report';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      sbom: true,
    },
  };
}

module(
  'Integration | Component | file/report-drawer/sbom-reports',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');
    setupBrowserFakes(hooks, { window: true, localStorage: true });

    hooks.beforeEach(async function () {
      setupFileModelEndpoints(this.server);

      this.owner.register('service:organization', OrganizationStub);

      const store = this.owner.lookup('service:store');

      const window = this.owner.lookup('service:browser/window');

      window.localStorage.clear();

      const createFile = (sbomId) => {
        if (!sbomId && sbomId !== null) {
          sbomId = this.server.create('sbom-file').id;
        }

        const file = this.server.create('file');
        const fileNormalized = store.normalize('file', file.toJSON());

        return store.push(fileNormalized);
      };

      this.setProperties({
        onClose: function () {},
        store,
        createFile,
      });

      // Server mocks
      this.server.get('/v2/sb_projects/:id', (schema, req) => {
        return schema.sbomProjects.find(req.params.id)?.toJSON();
      });

      this.server.get('/v2/sb_reports/:id', (schema, req) => {
        return schema.sbomReports.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/sb_files/:id', (schema, req) => {
        return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
        const results = schema.sbomReports.all().models;
        return { count: results.length, next: null, previous: null, results };
      });
    });

    test('it shows sample reports if org does not have sbom access', async function (assert) {
      // SBOM is inactive for org
      class OrganizationStub extends Service {
        selected = {
          id: 1,
          features: {
            sbom: false,
          },
        };
      }

      this.file = this.createFile();

      this.owner.register('service:organization', OrganizationStub);

      await render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{@onClose}}  />`
      );

      assert.dom('[data-test-fileReportDrawer-sbomReports-root]').exists();
      assert.dom('[data-test-sbomReports-contactSupportIllustration]').exists();

      assert
        .dom('[data-test-sbomReports-sbomSampleReportText1]')
        .exists()
        .hasText(t('fileReport.sbomSampleReportText1'));

      assert
        .dom('[data-test-sbomReports-sbomSampleReportText2]')
        .exists()
        .hasText(t('fileReport.sbomSampleReportText2'));

      assert
        .dom('[data-test-sbomReports-contactUsButton]')
        .exists()
        .hasText(t('clickHere'));

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sampleReports]')
        .exists();
    });

    test('it shows loading state and generate button if org has access and sbom pdf report is pending', async function (assert) {
      const sbomProject = this.server.create('sbom-project');

      const sbomFile = this.server.create('sbom-file', {
        id: 101,
        status: SbomReportStatus.COMPLETED,
        sb_project: sbomProject.id,
      });

      this.file = this.createFile(sbomFile.id);

      this.server.create('sbom-report', {
        pdf_status: SbomReportStatus.PENDING,
      });

      this.server.get(
        '/v2/sb_files/:id',
        (schema, req) => {
          return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
        },
        { timing: 500 }
      );

      this.server.get(
        '/v2/sb_projects/:id',
        (schema, req) => {
          return schema.sbomProjects.find(req.params.id)?.toJSON();
        },
        { timing: 500 }
      );

      this.server.get('/v3/files/:id/sbom_file', (schema) => {
        return schema.sbomFiles.find(`${sbomFile.id}`)?.toJSON();
      });

      render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      await waitFor('[data-test-fileReportDrawer-sbomReports-root]', {
        timeout: 500,
      });

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-reportLoader]')
        .exists();

      await waitFor('[data-test-fileReportDrawer-sbomReports-reportsList]', {
        timeout: 500,
      });

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-reportsList]')
        .exists();

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sampleReports]')
        .doesNotExist();

      await waitFor('[data-test-sbomReportList-reportlistItem]', {
        timeout: 500,
      });

      const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

      // PDF Generate Report check
      assert
        .dom('[data-test-sbomReportList-reportGenerateTitle]', reportList[0])
        .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

      assert
        .dom('[data-test-sbomReportList-reportGenerateTitle]', reportList[0])
        .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

      assert
        .dom('[data-test-sbomReportList-reportGenerateSvg]', reportList[0])
        .exists();

      assert
        .dom(
          '[data-test-sbomReportList-reportGenerateDescription]',
          reportList[0]
        )
        .hasText(t('sbomModule.generateReportDescription'));

      assert
        .dom('[data-test-sbomReportList-reportGenerateBtn]', reportList[0])
        .isNotDisabled()
        .hasText(t('generateReport'));

      // static JSON report check
      assert
        .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[1])
        .hasText(t('sbomModule.sbomDownloadJsonPrimaryText'));

      assert
        .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[1])
        .hasText(t('sbomModule.sbomDownloadJsonSecondaryText'));

      assert
        .dom('[data-test-sbomReportList-reportDownloadBtn]', reportList[1])
        .isNotDisabled();

      await waitUntil(
        () =>
          find(
            '[data-test-fileReportDrawer-sbomReports-sbomFileLink]'
          ).getAttribute('href') !== '#'
      );

      // Link to sbom file
      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sbomFileLink]')
        .exists()
        .hasText(t('fileReport.viewSbomDetails'))
        .hasAttribute('href', new RegExp(sbomFile.id));
    });

    test('it renders sbom pdf report if generated', async function (assert) {
      const sbomProject = this.server.create('sbom-project');

      const sbomFile = this.server.create('sbom-file', {
        id: 101,
        status: SbomReportStatus.COMPLETED,
        sb_project: sbomProject.id,
      });

      const sbomFileModel = this.store.push(
        this.store.normalize('sbom-file', sbomFile.toJSON())
      );

      this.file = this.createFile(sbomFile.id);

      const sbomReport = this.server.create('sbom-report', {
        pdf_progress: 100,
        pdf_status: SbomReportStatus.COMPLETED,
      });

      this.server.get('/v3/files/:id/sbom_file', (schema) => {
        return schema.sbomFiles.find(`${sbomFile.id}`)?.toJSON();
      });

      await render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

      // Test for generated pdf report state
      assert
        .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[0])
        .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

      assert
        .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[0])
        .hasText(
          t('sbomModule.sbomDownloadPdfSecondaryText', {
            password: sbomReport.report_password,
          })
        );

      assert
        .dom('[data-test-sbomReportList-reportCopyBtn]', reportList[0])
        .isNotDisabled()
        .hasAttribute('data-clipboard-text', sbomReport.report_password);

      assert
        .dom('[data-test-sbomReportList-reportDownloadBtn]', reportList[0])
        .isNotDisabled();

      // Link to sbom file
      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sbomFileLink]')
        .exists()
        .hasText(t('fileReport.viewSbomDetails'))
        .hasAttribute(
          'href',
          new RegExp(
            `\\b(?:${sbomFileModel.id}|${sbomFileModel.sbProject.get('id')})\\b`
          )
        );
    });

    test('it renders pending state if sbom scan is pending', async function (assert) {
      const sbomProject = this.server.create('sbom-project');

      const sbomFile = this.server.create('sbom-file', {
        id: 101,
        status: SbomReportStatus.PENDING,
        sb_project: sbomProject.id,
      });

      const sbomFileModel = this.store.push(
        this.store.normalize('sbom-file', sbomFile.toJSON())
      );

      this.file = this.createFile(sbomFile.id);

      this.server.get('/v3/files/:id/sbom_file', (schema) => {
        return schema.sbomFiles.find(`${sbomFile.id}`)?.toJSON();
      });

      await render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-pendingIllustration]')
        .exists();

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-pendingDescription]')
        .exists()
        .hasText(t('fileReport.sbomReportInProgress'));

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sbomFileLink]')
        .exists()
        .hasText(t('fileReport.viewSbomDetails'))
        .hasAttribute('href', new RegExp(sbomFileModel.id));
    });

    test('it renders empty state if no sbom file is found', async function (assert) {
      this.file = this.createFile(null);

      await render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-noSbomReportsContainer]')
        .exists();

      assert
        .dom(
          '[data-test-fileReportDrawer-sbomReports-noSbomReportsIllustration]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileReportDrawer-sbomReports-noSbomReportsDescription]'
        )
        .exists()
        .hasText(t('fileReport.noSbomReportAvailable'));
    });
  }
);
