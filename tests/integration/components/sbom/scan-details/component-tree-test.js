import {
  render,
  findAll,
  click,
  waitFor,
  waitUntil,
  find,
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

      this.server.get('/v2/sb_files/:id', (schema, req) => {
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

      const sbomComponents = this.server.createList('sbom-component', 10, {
        sb_file: sbomFile.id,
      });

      this.setProperties({
        sbomProject: store.push(sbomProjectNormalized),
        sbomFile: store.push(sbomFileNormalized),
        sbomScanSummary: store.push(sbomScanSummaryNormalized),
        packageName: sbomProject.project.packageName,
        expandedNodes: [],
        treeNodes: [],
        updateTreeNodes: (nodes) => {
          this.set('treeNodes', nodes);
        },
        updateExpandedNodes: (nodes) => {
          this.set('expandedNodes', nodes);
        },
        sbomComponents,
        store,
      });
    });

    test('it renders sbom scan component tree and handles node expansion', async function (assert) {
      this.set('dependencyAPICalled', false);

      // Get the first component from the store after normalization
      const component = await this.store.findRecord(
        'sbom-component',
        this.sbomComponents[0].id
      );

      // Set the properties on the normalized model
      component.dependencyCount = 3;
      component.isDependency = false;

      // Update the server mock to return the modified data
      this.server.get(
        '/v2/sb_files/:id/sb_file_components',
        (schema, request) => {
          this.set('query', request.queryParams.q);

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

      this.server.get(
        '/v2/sb_file_component/:comp_id/dependencies',
        (schema, request) => {
          const { comp_id } = request.params;

          const allResults = schema.sbomComponents
            .all()
            .models.filter(
              (component) =>
                component.parentId === Number(comp_id) &&
                component.is_dependency
            );

          const paginatedResults = allResults.slice(
            request.queryParams.offset,
            request.queryParams.offset + request.queryParams.limit
          );

          this.set('dependencyAPICalled', true);

          return {
            count: allResults.length,
            next: null,
            previous: null,
            results: paginatedResults,
          };
        }
      );

      await render(hbs`
        <Sbom::ScanDetails::ComponentTree 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @packageName={{this.packageName}}
          @updateExpandedNodes={{this.updateExpandedNodes}}
          @expandedNodes={{this.expandedNodes}}
          @treeNodes={{this.treeNodes}}
          @updateTreeNodes={{this.updateTreeNodes}}
        />
      `);

      await waitFor('[data-test-component-tree]', { timeout: 500 });

      assert.dom('[data-test-component-tree]').exists();

      const nodes = findAll('[data-test-component-tree-node]');

      const nodeLabels = findAll('[data-test-component-tree-nodeLabel]');

      // First node sanity check
      assert.dom(nodeLabels[0]).containsText(this.sbomComponents[0].name);

      // Test node expansion
      const expandIcon = nodes[0].querySelector(
        '[data-test-component-tree-nodeExpandIcon]'
      );

      // Click to expand
      await click(expandIcon);

      assert.true(this.dependencyAPICalled);

      await waitUntil(() => !find('[data-test-component-tree-child-loader]'), {
        timeout: 150,
      });

      assert.ok(
        this.expandedNodes.includes(this.sbomComponents[0].id.toString()),
        'Node ID is added to expanded nodes'
      );
    });

    test('it handles empty state correctly', async function (assert) {
      this.server.get('/v2/sb_files/:id/sb_file_components', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });

      await render(hbs`
        <Sbom::ScanDetails::ComponentTree 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @packageName={{this.packageName}}
          @updateExpandedNodes={{this.updateExpandedNodes}}
          @expandedNodes={{this.expandedNodes}}
          @treeNodes={{this.treeNodes}}
          @updateTreeNodes={{this.updateTreeNodes}}
        />
      `);

      await waitFor('[data-test-sbomComponent-emptySvg]');
      assert
        .dom('[data-test-sbomComponent-emptySvg]')
        .exists('Empty state SVG is shown');
      assert
        .dom('[data-test-sbomComponent-emptyTextTitle]')
        .exists('Empty state title is shown');
      assert
        .dom('[data-test-sbomComponent-emptyTextDescription]')
        .exists('Empty state description is shown');
    });

    test.each(
      'test sbom scan component outdated version',
      [
        { latest_version: '1.0.0', version: '1.0.0' },
        { latest_version: '2.0.0', version: '1.0.0' },
      ],
      async function (assert, versions) {
        this.sbomComponents[0].version = versions.version;

        this.sbomComponents[0].latest_version = versions.latest_version;

        this.server.get('/v2/sb_files/:scan_id/sb_file_components', () => {
          const results = this.sbomComponents;

          return { count: results.length, next: null, previous: null, results };
        });

        await render(hbs`
          <Sbom::ScanDetails::ComponentTree 
            @sbomProject={{this.sbomProject}} 
            @sbomFile={{this.sbomFile}} 
            @packageName={{this.packageName}}
            @updateExpandedNodes={{this.updateExpandedNodes}}
            @expandedNodes={{this.expandedNodes}}
            @treeNodes={{this.treeNodes}}
            @updateTreeNodes={{this.updateTreeNodes}}
          />
        `);

        const nodes = findAll('[data-test-component-tree-node]');

        if (versions.latest_version === versions.version) {
          assert
            .dom(
              `[data-test-sbomComponent-status="${t('chipStatus.outdated')}"]`,
              nodes[0]
            )
            .doesNotExist();
        } else {
          assert
            .dom(
              `[data-test-sbomComponent-status="${t('chipStatus.outdated')}"]`,
              nodes[0]
            )
            .exists();
        }
      }
    );

    test.each(
      'test sbom scan component vulnerable chip',
      [true, false],
      async function (assert, vulnerable) {
        const component = await this.store.findRecord(
          'sbom-component',
          this.sbomComponents[0].id
        );

        component.vulnerabilitiesCount = vulnerable ? 1 : 0;

        this.server.get('/v2/sb_files/:scan_id/sb_file_components', () => {
          const results = this.sbomComponents;

          return { count: results.length, next: null, previous: null, results };
        });

        await render(hbs`
          <Sbom::ScanDetails::ComponentTree 
            @sbomProject={{this.sbomProject}} 
            @sbomFile={{this.sbomFile}} 
            @packageName={{this.packageName}}
            @updateExpandedNodes={{this.updateExpandedNodes}}
            @expandedNodes={{this.expandedNodes}}
            @treeNodes={{this.treeNodes}}
            @updateTreeNodes={{this.updateTreeNodes}}
          />
        `);

        const nodes = findAll('[data-test-component-tree-node]');

        if (vulnerable) {
          assert
            .dom(
              `[data-test-sbomComponent-status="${t('chipStatus.vulnerable')}"]`,
              nodes[0]
            )
            .exists();
        } else {
          assert
            .dom(
              `[data-test-sbomComponent-status="${t('chipStatus.secure')}"]`,
              nodes[0]
            )
            .exists();
        }
      }
    );
  }
);
