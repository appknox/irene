import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { findAll, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { SbomReportStatus } from 'irene/models/sbom-report';

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
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:organization', OrganizationStub);

      const store = this.owner.lookup('service:store');

      const createFile = (sbomId) => {
        if (!sbomId && sbomId !== null) {
          sbomId = this.server.create('sbom-file').id;
        }

        const file = this.server.create('file');
        const fileNormalized = store.normalize('file', {
          ...file.toJSON(),
          sb_file: sbomId,
        });

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
        { timing: 100 }
      );

      this.server.get(
        '/v2/sb_projects/:id',
        (schema, req) => {
          return schema.sbomProjects.find(req.params.id)?.toJSON();
        },
        { timing: 100 }
      );

      render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      await waitFor('[data-test-fileReportDrawer-sbomReports-root]', {
        timeout: 100,
      });

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-reportLoader]')
        .exists();

      await waitFor('[data-test-fileReportDrawer-sbomReports-reportsList]', {
        timeout: 100,
      });

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-reportsList]')
        .exists();

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sampleReports]')
        .doesNotExist();

      await waitFor('[data-test-sbomReportList-reportlistItem]', {
        timeout: 100,
      });

      const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

      // PDF Generate Report check
      assert
        .dom('[data-test-sbomReportList-reportGenerateTitle]', reportList[0])
        .hasText('t:sbomModule.sbomDownloadPdfPrimaryText:()');

      assert
        .dom('[data-test-sbomReportList-reportGenerateTitle]', reportList[0])
        .hasText('t:sbomModule.sbomDownloadPdfPrimaryText:()');

      assert
        .dom('[data-test-sbomReportList-reportGenerateSvg]', reportList[0])
        .exists();

      assert
        .dom(
          '[data-test-sbomReportList-reportGenerateDescription]',
          reportList[0]
        )
        .hasText('t:sbomModule.generateReportDescription:()');

      assert
        .dom('[data-test-sbomReportList-reportGenerateBtn]', reportList[0])
        .isNotDisabled()
        .hasText('t:generateReport:()');

      // static JSON report check
      assert
        .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[1])
        .hasText('t:sbomModule.sbomDownloadJsonPrimaryText:()');

      assert
        .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[1])
        .hasText('t:sbomModule.sbomDownloadJsonSecondaryText:()');

      assert
        .dom('[data-test-sbomReportList-reportDownloadBtn]', reportList[1])
        .isNotDisabled();

      // Link to sbom file
      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sbomFileLink]')
        .exists()
        .hasText('t:fileReport.viewSbomDetails:()')
        .hasAttribute('href', new RegExp(this.file.sbFile.get('id')));
    });

    test('it renders sbom pdf report if generated', async function (assert) {
      const sbomProject = this.server.create('sbom-project');

      const sbomFile = this.server.create('sbom-file', {
        id: 101,
        status: SbomReportStatus.COMPLETED,
        sb_project: sbomProject.id,
      });

      this.file = this.createFile(sbomFile.id);

      const sbomReport = this.server.create('sbom-report', {
        pdf_progress: 100,
        pdf_status: SbomReportStatus.COMPLETED,
      });

      await render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

      // Test for generated pdf report state
      assert
        .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[0])
        .hasText('t:sbomModule.sbomDownloadPdfPrimaryText:()');

      assert
        .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[0])
        .hasText(
          `t:sbomModule.sbomDownloadPdfSecondaryText:("password":"${sbomReport.report_password}")`
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
        .hasText('t:fileReport.viewSbomDetails:()')
        .hasAttribute(
          'href',
          new RegExp(
            `\\b(?:${this.file.sbFile.get('id')}|${this.file.sbFile
              .get('sbProject')
              .get('id')})\\b`
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

      this.file = this.createFile(sbomFile.id);

      await render(
        hbs`<File::ReportDrawer::SbomReports @file={{this.file}} @closeDrawer={{this.onClose}}  />`
      );

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-pendingIllustration]')
        .exists();

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-pendingDescription]')
        .exists()
        .hasText('t:fileReport.sbomReportInProgress:()');

      assert
        .dom('[data-test-fileReportDrawer-sbomReports-sbomFileLink]')
        .exists()
        .hasText('t:fileReport.viewSbomDetails:()')
        .hasAttribute('href', new RegExp(this.file.sbFile.get('id')));
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
        .hasText('t:fileReport.noSbomReportAvailable:()');
    });
  }
);
