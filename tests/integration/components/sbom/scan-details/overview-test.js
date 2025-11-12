import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomScanStatus } from 'irene/models/sbom-file';

module(
  'Integration | Component | sbom/scan-details/overview',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);
      const project = this.server.create('project', 1, {
        last_file: file,
      });
      const sbomScanSummary = this.server.create('sbom-scan-summary', 1);

      this.server.createList('sbom-component', 10);

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
      const sbomFileNormalized = store.normalize(
        'sbom-file',
        sbomFile.toJSON()
      );

      const sbomScanSummaryNormalized = store.normalize(
        'sbom-scan-summary',
        sbomScanSummary.toJSON()
      );

      this.setProperties({
        sbomProject: store.push(sbomProjectNormalized),
        sbomFile: store.push(sbomFileNormalized),
        sbomScanSummary: store.push(sbomScanSummaryNormalized),
      });

      // Server mock
      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });
    });

    test('it renders scan summary details', async function (assert) {
      this.server.get('/v2/sb_files/:id/sb_file_components', (schema) => {
        const results = schema.sbomComponents.all().models;

        return {
          count: results.length,
          next: null,
          previous: null,
          results: results,
        };
      });

      this.sbomFile.status = SbomScanStatus.COMPLETED;

      await render(hbs`
        <Sbom::ScanDetails::Overview
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      assert.dom('[data-test-sbomScanDetails-overview-container]').exists();
      assert
        .dom('[data-test-sbomScanDetails-overview-title]')
        .hasText(t('overview'));

      const expectedScanSummaryItems = [
        {
          iconName: 'ph:diamonds-four',
          label: t('sbomModule.totalComponents'),
          value: this.sbomScanSummary.componentCount,
        },
        {
          iconName: 'hugeicons:ai-brain-04',
          label: t('sbomModule.mlModel'),
          value: this.sbomScanSummary.machineLearningModelCount,
          newFeature: true,
        },
        {
          iconName: 'solar:library-linear',
          label: t('library'),
          value: this.sbomScanSummary.libraryCount,
        },
        {
          iconName: 'mynaui:frame',
          label: t('framework'),
          value: this.sbomScanSummary.frameworkCount,
        },
        {
          iconName: 'draft',
          label: t('file'),
          value: this.sbomScanSummary.fileCount,
          hideDivider: true,
        },
      ];

      expectedScanSummaryItems.forEach((item) => {
        const summarySelector = `[data-test-sbomScanDetails-overview-scanSummary="${item.label}"]`;

        assert
          .dom(
            `${summarySelector} [data-test-sbomScanDetails-overview-scanSummary-label]`
          )
          .hasText(item.label);

        assert
          .dom(
            `${summarySelector} [data-test-sbomScanDetails-overview-scanSummary-value]`
          )
          .hasText(`${item.value}`);

        if (item.newFeature) {
          assert
            .dom(
              `${summarySelector} [data-test-sbomScanDetails-overview-newFeatureIcon]`
            )
            .exists();
        }
      });

      assert
        .dom('[data-test-sbomScanDetails-overview-icon]')
        .exists({ count: expectedScanSummaryItems.length });
    });
  }
);
