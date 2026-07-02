import { find, render, waitFor } from '@ember/test-helpers';

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

    test('it shows the same headings in the skeleton loader as in the ai bom table', async function (assert) {
      this.server.createList('sbom-component', 3);

      this.server.get(
        `/v2/sb_files/${this.sbomFileModelId}/sb_file_components/ai_summary`,
        () => ({ total: 3, by_type: { model: 3 }, aibom_supported: true })
      );

      this.server.get(
        '/v2/sb_files/:id/sb_file_components',
        (schema) => {
          const results = schema.sbomComponents.all().models;

          return {
            count: results.length,
            next: null,
            previous: null,
            results,
          };
        },
        { timing: 500 }
      );

      const sbomService = this.owner.lookup('service:sbom-scan-details');

      // not awaited -- the skeleton is only on screen while this is in flight
      sbomService.reload();

      render(hbs`
        <Sbom::ScanDetails::AiBomComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      await waitFor('[data-test-component-list-skeleton-loader]', {
        timeout: 500,
      });

      const skeletonHeadings = [
        ...find(
          '[data-test-component-list-skeleton-loader] tr'
        ).querySelectorAll('th'),
      ].map((th) => th.textContent.trim());

      // the AI BoM columns, not the SBOM tab's name/type/dependency/status
      assert.deepEqual(skeletonHeadings, [
        t('sbomModule.componentName'),
        t('sbomModule.componentType'),
        t('sbomModule.purpose'),
      ]);

      await waitFor('[data-test-sbomScanDetails-aiBomComponentTable]', {
        timeout: 1000,
      });

      const headerRow = find(
        '[data-test-sbomScanDetails-aiBomComponentThead] tr'
      ).querySelectorAll('th');

      assert.strictEqual(headerRow.length, skeletonHeadings.length);

      assert.dom(headerRow[0]).hasText(t('sbomModule.componentName'));
      assert.dom(headerRow[2]).hasText(t('sbomModule.purpose'));
    });

    test('it falls back to the class-derived purpose when the backend sends no ai_purpose', async function (assert) {
      // A component scanned before purpose-emission existed: artifact class is
      // known, ai_purpose is empty. The column must show the same fallback the
      // drawer does, not a blank cell.
      this.server.create('sbom-component', {
        ai_purpose: '',
        ai_model_category: '',
        ai_artifact_class: 'secret',
        is_ai_component: true,
      });

      this.server.get(
        `/v2/sb_files/${this.sbomFileModelId}/sb_file_components/ai_summary`,
        () => ({ total: 1, by_type: { secret: 1 }, aibom_supported: true })
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

      const cells = find(
        '[data-test-sbomScanDetails-aiBomComponentRow]'
      ).querySelectorAll('[data-test-sbomScanDetails-aiBomComponentCell]');

      assert
        .dom(cells[2])
        .hasText(t('sbomModule.aiPurposeFallback.secret'), 'purpose not blank');
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
