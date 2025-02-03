import {
  render,
  findAll,
  pauseTest,
  waitFor,
  click,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/scan-details/component-tree',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);
      const project = this.server.create('project', 1, {
        last_file_id: file.id,
      });
      const sbomScanSummary = this.server.create('sbom-scan-summary', 1);

      const sbomProject = this.server.create('sbom-project', 1, {
        project: project.id,
      });

      const sbomFile = this.server.create('sbom-file', 1, {
        file: file.id,
        sb_project: sbomProject.id,
      });

      this.server.get('/v3/sb_files/:id', (schema, req) => {
        return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
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

      const sbomComponents = this.server.createList('sbom-component', 15);

      this.setProperties({
        sbomProject: store.push(sbomProjectNormalized),
        sbomFile: store.push(sbomFileNormalized),
        sbomScanSummary: store.push(sbomScanSummaryNormalized),
        packageName: sbomProject.project.packageName,
        expandedNodes: [],
        updateExpandedNodes: (nodes) => {
          this.expandedNodes = nodes;
        },
        sbomComponents,
        queryParams: {
          component_limit: 15,
          component_offset: 0,
          component_query: '',
          type: 1,
        },
        store,
      });
    });

    test('it renders sbom scan component tree and handles node expansion', async function (assert) {
      this.server.get('/v3/sb_files/:id/sb_components', (schema, request) => {
        this.set('query', request.queryParams.q);

        const results = schema.sbomComponents.all().models;

        let limit = 15;
        let offset = 0;

        if (request.queryParams.limit) {
          limit = request.queryParams.limit;
        }

        if (request.queryParams.offset) {
          offset = request.queryParams.offset;
        }

        const retdata = results.slice(offset, offset + limit);

        return {
          count: retdata.length,
          next: null,
          previous: null,
          results: retdata,
        };
      });

      this.server.get(
        '/v3/sb_files/:id/sb_components/:comp_id/dependencies',
        (schema) => {
          const results = schema.sbomComponents.all().models.slice(0, 3); // Return fewer items for dependencies
          return { count: results.length, next: null, previous: null, results };
        }
      );

      await render(hbs`
        <Sbom::ScanDetails::ComponentTree 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @packageName={{this.packageName}}
          @updateExpandedNodes={{this.updateExpandedNodes}}
          @expandedNodes={{this.expandedNodes}}
        />
      `);

      const nodes = findAll('[data-test-component-tree-node]');

      assert.strictEqual(
        nodes.length,
        15,
        'Renders correct number of root nodes'
      );

      // Test node expansion
      const firstNode = nodes[0];
      const expandIcon = firstNode.querySelector(
        '[data-test-component-tree-nodeExpandIcon]'
      );

      // Click to expand
      await click(expandIcon);

      assert.ok(
        this.expandedNodes.includes(this.sbomComponents[0].id.toString()),
        'Node ID is added to expanded nodes'
      );

      // Test node content
      assert
        .dom('[data-test-component-tree-nodeLabel]', firstNode)
        .containsText(
          this.sbomComponents[0].name,
          'Node displays correct name'
        );

      // Test status chips
      if (this.sbomComponents[0].isOutdated) {
        assert
          .dom(
            `[data-test-sbomComponent-status="${t('chipStatus.outdated')}"]`,
            firstNode
          )
          .hasText(t('chipStatus.outdated'), 'Shows outdated status');
      }

      if (this.sbomComponents[0].isVulnerable) {
        assert
          .dom(
            `[data-test-sbomComponent-status="${t('chipStatus.vulnerable')}"]`,
            firstNode
          )
          .hasText(t('chipStatus.vulnerable'), 'Shows vulnerable status');
      } else {
        assert
          .dom(
            `[data-test-sbomComponent-status="${t('chipStatus.secure')}"]`,
            firstNode
          )
          .hasText(t('chipStatus.secure'), 'Shows secure status');
      }

      // Test collapse
      await click(expandIcon);

      assert.notOk(
        this.expandedNodes.includes(this.sbomComponents[0].id.toString()),
        'Node ID is removed from expanded nodes'
      );
    });
  }
);
