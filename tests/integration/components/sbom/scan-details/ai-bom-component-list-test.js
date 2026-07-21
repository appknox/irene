import { render, waitFor, findAll } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/scan-details/ai-bom-component-list',
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

      const sbomProject = this.server.create('sbom-project', 1, {
        project: project.id,
      });

      const sbomFile = this.server.create('sbom-file', 1, {
        file: file.id,
        sb_project: sbomProject.id,
      });

      sbomProject.latest_sb_file = sbomFile.id;

      const sbomProjectRecord = store.push(
        store.normalize('sbom-project', sbomProject.toJSON())
      );

      const sbomFileRecord = store.push(
        store.normalize('sbom-file', sbomFile.toJSON())
      );

      const sbomScanSummaryRecord = store.push(
        store.normalize('sbom-scan-summary', sbomScanSummary.toJSON())
      );

      this.server.get(
        '/v2/sb_files/:id/sb_file_components',
        (schema, request) => {
          const results = schema.sbomComponents.all().models;

          const retdata = results.slice(
            request.queryParams.offset,
            request.queryParams.offset + request.queryParams.limit
          );

          return {
            count: retdata.length,
            next: null,
            previous: null,
            results: retdata,
          };
        }
      );

      const sbomService = this.owner.lookup('service:sbom-scan-details');

      sbomService.setQueryData({
        view_type: 'list',
        component_type: -1,
        is_dependency: null,
        component_query: '',
        sbomFile,
      });

      await sbomService.reload();

      this.setProperties({
        sbomProject: sbomProjectRecord,
        sbomFile: sbomFileRecord,
        sbomScanSummary: sbomScanSummaryRecord,
        sbomFileModelId: sbomFile.id,
      });
    });

    test('it shows the generic empty state when the scan supports ai detection and found nothing', async function (assert) {
      this.server.get(
        `/v2/sb_files/${this.sbomFileModelId}/sb_file_components/ai_summary`,
        () => ({ total: 0, by_type: {}, aibom_supported: true })
      );

      await render(hbs`
        <Sbom::ScanDetails::AiBomComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponent-emptyTextTitle]')
        .hasText(t('sbomModule.componentListEmptyText.title'));

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponent-newFeatureTitle]')
        .doesNotExist();
    });

    test('it shows the re-upload prompt when the file predates ai bom detection', async function (assert) {
      this.server.get(
        `/v2/sb_files/${this.sbomFileModelId}/sb_file_components/ai_summary`,
        () => ({ total: 0, by_type: {}, aibom_supported: false })
      );

      await render(hbs`
        <Sbom::ScanDetails::AiBomComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      await waitFor(
        '[data-test-sbomScanDetails-aiBomComponent-newFeatureTitle]'
      );

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponent-newFeatureTitle]')
        .hasText(t('sbomModule.aiBomNewFeatureEmptyText.title'));

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponent-newFeatureDescription]')
        .hasText(t('sbomModule.aiBomNewFeatureEmptyText.description'));

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponent-emptyTextTitle]')
        .doesNotExist();
    });

    test('it shows real components instead of the re-upload prompt when the file predates ai bom detection but already has components', async function (assert) {
      this.server.createList('sbom-component', 3);

      this.server.get(
        `/v2/sb_files/${this.sbomFileModelId}/sb_file_components/ai_summary`,
        () => ({ total: 3, by_type: { model: 3 }, aibom_supported: false })
      );

      const sbomService = this.owner.lookup('service:sbom-scan-details');
      await sbomService.reload();

      await render(hbs`
        <Sbom::ScanDetails::AiBomComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      await waitFor('[data-test-sbomScanDetails-aiBomComponentTable]');

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponentRow]')
        .exists({ count: 3 });

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponent-newFeatureTitle]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomScanDetails-aiBomComponent-emptyTextTitle]')
        .doesNotExist();
    });
  }
);
