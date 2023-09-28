import { render, click } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomScanStatus } from 'irene/models/sbom-file';

module('Integration | Component | sbom/scan-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const file = this.server.create('file', 1);
    const project = this.server.create('project', 1, { last_file_id: file.id });
    const sbomScanSummary = this.server.create('sbom-scan-summary', 1);

    const sbomProject = this.server.create('sbom-project', 1, {
      project: project.id,
    });

    const sbomFile = this.server.create('sbom-file', 1, {
      file: file.id,
      sb_project: sbomProject.id,
    });

    sbomProject.latest_sb_file = sbomFile.id;

    const sbomProjectNormalized = store.normalize(
      'sbom-project',
      sbomProject.toJSON()
    );
    const sbomFileNormalized = store.normalize('sbom-file', sbomFile.toJSON());

    const sbomScanSummaryNormalized = store.normalize(
      'sbom-scan-summary',
      sbomScanSummary.toJSON()
    );

    this.setProperties({
      sbomProject: store.push(sbomProjectNormalized),
      sbomFile: store.push(sbomFileNormalized),
      sbomScanSummary: store.push(sbomScanSummaryNormalized),
      queryParams: {
        component_limit: 10,
        component_offset: 0,
        component_query: '',
      },
    });

    // Server mock
    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });
  });

  test.each(
    'it renders sbom scan details',
    [
      SbomScanStatus.PENDING,
      SbomScanStatus.IN_PROGRESS,
      SbomScanStatus.COMPLETED,
      SbomScanStatus.FAILED,
    ],
    async function (assert, status) {
      this.sbomFile.status = status;

      await render(hbs`
        <Sbom::ScanDetails 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @sbomScanSummary={{this.sbomScanSummary}} 
          @queryParams={{this.queryParams}} 
        />
      `);

      assert
        .dom('[data-test-sbomScanDetails-componentTitle]')
        .hasText('t:sbomModule.allComponents:()');

      assert
        .dom('[data-test-sbomScanDetails-componentDescription]')
        .hasText('t:sbomModule.componentDescription:()');

      // assert.dom('[data-test-sbomScanDetails-componentSearchInput]').hasNoValue();

      assert.dom('[data-test-sbomScanDetails-container]').exists();

      assert
        .dom('[data-test-sbomScanDetails-pastSbomAnalyses-link]')
        .exists()
        .hasText('t:sbomModule.pastSbomAnalyses:()');

      if (status === SbomScanStatus.COMPLETED) {
        assert
          .dom('[data-test-sbomScanDetails-viewReport-btn]')
          .exists()
          .containsText('t:sbomModule.viewReport:()');
      } else {
        assert.dom('[data-test-sbomScanDetails-viewReport-btn]').doesNotExist();
      }

      // By default the content is collapsed"
      assert
        .dom('[data-test-sbomSummaryHeader-collapsibleToggleBtn]')
        .isNotDisabled();

      assert
        .dom('[data-test-sbomSummaryHeader-collapsibleContent]')
        .doesNotExist();

      assert.dom('[data-test-fileScanSummary-container]').doesNotExist();

      if (status === SbomScanStatus.COMPLETED) {
        assert
          .dom('[data-test-sbomScanDetails-componentList-container]')
          .exists();
      } else {
        if (status === SbomScanStatus.FAILED) {
          assert
            .dom('[data-test-sbomScanDetails-scanStatusFailedSvg]')
            .exists();

          assert
            .dom('[data-test-sbomScanDetails-scanStatusTitle]')
            .hasText('t:sbomModule.sbomScanStatusError.title:()');

          assert
            .dom('[data-test-sbomScanDetails-scanStatusDescription]')
            .hasText('t:sbomModule.sbomScanStatusError.description:()');
        }

        if (
          status === SbomScanStatus.PENDING ||
          status === SbomScanStatus.IN_PROGRESS
        ) {
          assert
            .dom('[data-test-sbomScanDetails-scanStatusInProgressSvg]')
            .exists();

          assert
            .dom('[data-test-sbomScanDetails-scanStatusTitle]')
            .hasText('t:sbomModule.sbomScanStatusProgress.title:()');

          assert
            .dom('[data-test-sbomScanDetails-scanStatusDescription]')
            .hasText('t:sbomModule.sbomScanStatusProgress.description:()');
        }
      }

      assert.dom('[data-test-sbomReportDrawer-drawer]').doesNotExist();
    }
  );

  test('it toggles file and scan  summary on header toggle collapse button click', async function (assert) {
    this.sbomFile.status = SbomScanStatus.COMPLETED;

    await render(hbs`
      <Sbom::ScanDetails 
        @sbomProject={{this.sbomProject}} 
        @sbomFile={{this.sbomFile}} 
        @sbomScanSummary={{this.sbomScanSummary}} 
        @queryParams={{this.queryParams}} 
      />
    `);

    assert.dom('[data-test-fileScanSummary-container]').doesNotExist();

    assert
      .dom('[data-test-sbomSummaryHeader-collapsibleToggleBtn]')
      .isNotDisabled();

    assert
      .dom('[data-test-sbomSummaryHeader-collapsibleContent]')
      .doesNotExist();

    // Show file and scan summary
    await click('[data-test-sbomSummaryHeader-collapsibleToggleBtn]');

    assert.dom('[data-test-sbomSummaryHeader-collapsibleContent]').exists();

    assert.dom('[data-test-fileScanSummary-container]').exists();

    // File summary tests
    const fileSummaryDetailsList = [
      {
        label: 't:version:()',
        value: this.sbomFile.get('file').get('version'),
      },
      {
        label: 't:sbomModule.versionCode:()',
        value: this.sbomFile.get('file').get('versionCode'),
      },
      {
        label: 't:file:()',
        value: this.sbomFile.get('file').get('id'),
        link: true,
      },
    ];

    for (const fileSummary of fileSummaryDetailsList) {
      assert
        .dom(
          `[data-test-sbomScanDetails-fileSummaryGroup="${fileSummary.label}"]`
        )
        .exists();

      assert
        .dom(
          `[data-test-sbomScanDetails-fileSummaryGroup="${fileSummary.label}"] [data-test-sbomScanDetails-fileSummaryGroup-label]`
        )
        .exists()
        .hasText(fileSummary.label);

      if (!fileSummary.link) {
        assert
          .dom(
            `[data-test-sbomScanDetails-fileSummaryGroup="${fileSummary.label}"] [data-test-sbomScanDetails-fileSummaryGroup-value]`
          )
          .exists()
          .hasText(fileSummary.value);
      } else {
        assert
          .dom(
            `[data-test-sbomScanDetails-fileSummaryGroup="${fileSummary.label}"] [data-test-sbomScanDetails-fileSummaryGroup-link]`
          )
          .exists()
          .hasText(fileSummary.value);
      }
    }

    // Scan summary tests
    const scanSummaryDetailsList = [
      {
        label: 't:sbomModule.totalComponents:()',
        value: [`${this.sbomScanSummary.componentCount}`],
      },
      {
        label: 't:sbomModule.componentType:()',
        value: [
          `t:library:() - ${this.sbomScanSummary.libraryCount}`,
          `t:framework:() - ${this.sbomScanSummary.frameworkCount}`,
          `t:application:() - ${this.sbomScanSummary.applicationCount}`,
          `t:container:() - ${this.sbomScanSummary.containerCount}`,
          `t:device:() - ${this.sbomScanSummary.deviceCount}`,
          `t:file:() - ${this.sbomScanSummary.fileCount}`,
          `t:firmware:() - ${this.sbomScanSummary.firmwareCount}`,
          `t:operatingSystem:() - ${this.sbomScanSummary.operatingSystemCount}`,
        ].filter((it) => !it.endsWith(' - 0')), // remove zero counts it will not be rendered
      },
      {
        label: 't:status:()',
        value: [],
        assertValue: () =>
          assert.dom('[data-test-sbom-scanStatus]').hasAnyText(),
      },
      {
        label: 't:sbomModule.generatedDate:()',
        value: [dayjs(this.sbomFile.completedAt).format('MMM DD, YYYY')],
      },
    ];

    for (const scanSummary of scanSummaryDetailsList) {
      assert
        .dom(
          `[data-test-sbomScanDetails-scanSummaryGroup="${scanSummary.label}"]`
        )
        .exists();

      assert
        .dom(
          `[data-test-sbomScanDetails-scanSummaryGroup="${scanSummary.label}"] [data-test-sbomScanDetails-scanSummaryGroup-label]`
        )
        .exists()
        .hasText(scanSummary.label);

      for (const value of scanSummary.value) {
        assert
          .dom(`[data-test-sbomScanDetails-scanSummaryGroup-value="${value}"]`)
          .exists()
          .hasText(value);
      }

      if (scanSummary.assertValue) {
        scanSummary.assertValue();
      }
    }

    // collapse file and scan summary
    await click('[data-test-sbomSummaryHeader-collapsibleToggleBtn]');

    assert.dom('[data-test-fileScanSummary-container]').doesNotExist();
  });

  test('it launches download report drawer on download report button click', async function (assert) {
    this.sbomFile.status = SbomScanStatus.COMPLETED;

    await render(hbs`
      <Sbom::ScanDetails 
        @sbomProject={{this.sbomProject}} 
        @sbomFile={{this.sbomFile}} 
        @sbomScanSummary={{this.sbomScanSummary}} 
        @queryParams={{this.queryParams}} 
      />
    `);

    assert.dom('[data-test-sbomReportDrawer-drawer]').doesNotExist();

    await click('[data-test-sbomScanDetails-viewReport-btn]');

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();
  });
});
