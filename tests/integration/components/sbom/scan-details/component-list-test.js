import {
  render,
  findAll,
  find,
  fillIn,
  triggerEvent,
  waitFor,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { capitalize } from '@ember/string';

module(
  'Integration | Component | sbom/scan-details/component-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

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

      const sbomComponents = this.server.createList('sbom-component', 10);

      this.setProperties({
        sbomProject: store.push(sbomProjectNormalized),
        sbomFile: store.push(sbomFileNormalized),
        sbomScanSummary: store.push(sbomScanSummaryNormalized),
        sbomComponents,
        queryParams: {
          component_limit: 10,
          component_offset: 0,
          component_query: '',
        },
        store,
      });
    });

    test('it renders sbom scan component list', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_components', (schema) => {
        const results = schema.sbomComponents.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <Sbom::ScanDetails::ComponentList 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @sbomScanSummary={{this.sbomScanSummary}} 
          @queryParams={{this.queryParams}} 
        />
      `);

      assert.dom('[data-test-sbomComponent-table]').exists();

      const headerRow = find(
        '[data-test-sbomComponent-thead] tr'
      ).querySelectorAll('th');

      // assert header row
      assert.dom(headerRow[0]).hasText('t:sbomModule.componentName:()');
      assert.dom(headerRow[1]).hasText('t:sbomModule.componentType:()');
      assert.dom(headerRow[2]).hasText('t:version:()');
      assert.dom(headerRow[3]).hasText('t:status:()');

      const contentRows = findAll('[data-test-sbomComponent-row]');

      assert.strictEqual(contentRows.length, this.sbomComponents.length);

      // first row sanity check
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-sbomComponent-cell]'
      );

      const sbomComponent = this.store.peekRecord(
        'sbom-component',
        this.sbomComponents[0].id
      );

      assert.dom(firstRow[0]).hasText(sbomComponent.name);

      assert.dom(firstRow[1]).hasText(capitalize(sbomComponent.type));

      assert
        .dom('[data-test-sbomComponent-version]', firstRow[2])
        .hasText(sbomComponent.version);

      if (sbomComponent.isOutdated) {
        assert
          .dom(
            '[data-test-sbomComponent-status="t:chipStatus.outdated:()"]',
            firstRow[3]
          )
          .hasText('t:chipStatus.outdated:()');
      }

      if (sbomComponent.isVulnerable) {
        assert
          .dom(
            '[data-test-sbomComponent-status="t:chipStatus.vulnerable:()"]',
            firstRow[3]
          )
          .hasText('t:chipStatus.vulnerable:()');
      } else {
        assert
          .dom(
            '[data-test-sbomComponent-status="t:chipStatus.secure:()"]',
            firstRow[3]
          )
          .hasText('t:chipStatus.secure:()');
      }
    });

    test.skip('test sbom scan component list search', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_components', (schema, req) => {
        this.set('query', req.queryParams.q);

        const results = schema.sbomComponents.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <Sbom::ScanDetails::ComponentList 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @sbomScanSummary={{this.sbomScanSummary}} 
          @queryParams={{this.queryParams}} 
        />
      `);

      assert.dom('[data-test-sbomComponent-searchInput]').hasNoValue();

      await fillIn('[data-test-sbomComponent-searchInput]', 'some query');
      await triggerEvent('[data-test-sbomComponent-searchInput]', 'keyup');

      assert
        .dom('[data-test-sbomComponent-searchInput]')
        .isNotDisabled()
        .hasValue(this.queryParams.component_query);

      assert.strictEqual(this.query, this.queryParams.component_query);
    });

    test('test sbom scan component outdated version', async function (assert) {
      this.sbomComponents[0].version = '1.0.0';

      this.sbomComponents[0].latest_version = '1.0.0';

      this.sbomComponents[1].version = '1.0.0';

      this.sbomComponents[1].latest_version = '2.0.0';

      this.server.get('/v2/sb_files/:scan_id/sb_components', () => {
        const results = this.sbomComponents;
        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <Sbom::ScanDetails::ComponentList 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @sbomScanSummary={{this.sbomScanSummary}} 
          @queryParams={{this.queryParams}} 
        />
      `);

      const contentRows = findAll('[data-test-sbomComponent-row]');

      assert.strictEqual(contentRows.length, this.sbomComponents.length);

      // first row sanity check
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-sbomComponent-cell]'
      );

      assert
        .dom('[data-test-sbomComponent-version]', firstRow[2])
        .hasText(this.sbomComponents[0].version);

      assert
        .dom(
          '[data-test-sbomComponent-status="t:chipStatus.outdated:()"]',
          firstRow[3]
        )
        .doesNotExist();

      // second row sanity check
      const secondRow = contentRows[1].querySelectorAll(
        '[data-test-sbomComponent-cell]'
      );

      assert
        .dom('[data-test-sbomComponent-version]', secondRow[2])
        .hasText(this.sbomComponents[1].version);

      assert
        .dom(
          '[data-test-sbomComponent-status="t:chipStatus.outdated:()"]',
          secondRow[3]
        )
        .hasText('t:chipStatus.outdated:()');
    });

    test('it renders sbom scan component list loading & empty state', async function (assert) {
      this.server.get(
        '/v2/sb_files/:scan_id/sb_components',
        () => {
          return { count: 0, next: null, previous: null, results: [] };
        },
        { timing: 500 }
      );

      render(hbs`
        <Sbom::ScanDetails::ComponentList 
          @sbomProject={{this.sbomProject}} 
          @sbomFile={{this.sbomFile}} 
          @sbomScanSummary={{this.sbomScanSummary}} 
          @queryParams={{this.queryParams}} 
        />
      `);

      await waitFor('[data-test-sbom-loadingSvg]', { timeout: 500 });

      // assert.dom('[data-test-sbomComponent-searchInput]').hasNoValue();

      assert.dom('[data-test-sbomComponent-table]').doesNotExist();

      assert.dom('[data-test-sbom-loadingSvg]').exists();

      assert.dom('[data-test-sbom-loader]').exists();
      assert.dom('[data-test-sbom-loadingText]').hasText('t:loading:()...');

      await waitFor('[data-test-sbomComponent-emptyTextTitle]', {
        timeout: 500,
      });

      assert
        .dom('[data-test-sbomComponent-emptyTextTitle]')
        .hasText('t:sbomModule.componentListEmptyText.title:()');

      assert
        .dom('[data-test-sbomComponent-emptyTextDescription]')
        .hasText('t:sbomModule.componentListEmptyText.description:()');

      assert.dom('[data-test-sbomComponent-emptySvg]').exists();
    });
  }
);
