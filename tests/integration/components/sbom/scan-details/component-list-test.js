import {
  render,
  click,
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

import Service from '@ember/service';

class RouterStub extends Service {
  transitionToArgs = [];

  transitionTo() {
    this.transitionToArgs = arguments;
  }
}

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

      const sbomApp = this.server.create('sbom-app', 1, {
        project: project.id,
      });

      const sbomScan = this.server.create('sbom-scan', 1, {
        file: file.id,
        sb_project: sbomApp.id,
      });

      sbomApp.latest_sb_file = sbomScan.id;

      const sbomAppNormalized = store.normalize('sbom-app', sbomApp.toJSON());
      const sbomScanNormalized = store.normalize(
        'sbom-scan',
        sbomScan.toJSON()
      );

      const sbomScanSummaryNormalized = store.normalize(
        'sbom-scan-summary',
        sbomScanSummary.toJSON()
      );

      const sbomScanComponents = this.server.createList(
        'sbom-scan-component',
        10
      );

      this.setProperties({
        sbomApp: store.push(sbomAppNormalized),
        sbomScan: store.push(sbomScanNormalized),
        sbomScanSummary: store.push(sbomScanSummaryNormalized),
        sbomScanComponents,
        queryParams: {
          component_limit: 10,
          component_offset: 0,
          component_query: '',
        },
      });

      this.owner.register('service:router', RouterStub);
    });

    test('it renders sbom scan component list', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_components', (schema) => {
        const results = schema.sbomScanComponents.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
      <Sbom::ScanDetails::ComponentList 
        @sbomApp={{this.sbomApp}} 
        @sbomScan={{this.sbomScan}} 
        @sbomScanSummary={{this.sbomScanSummary}} 
        @queryParams={{this.queryParams}} 
      />
    `);

      assert
        .dom('[data-test-sbomScanComponent-title]')
        .hasText('t:sbomModule.allComponents:()');

      // assert.dom('[data-test-sbomScanComponent-searchInput]').hasNoValue();

      assert.dom('[data-test-sbomScanComponent-table]').exists();

      const headerRow = find(
        '[data-test-sbomScanComponent-thead] tr'
      ).querySelectorAll('th');

      // assert header row
      assert.dom(headerRow[0]).hasText('t:sbomModule.componentName:()');
      assert.dom(headerRow[1]).hasText('t:sbomModule.componentType:()');
      assert.dom(headerRow[2]).hasText('t:version:()');
      assert.dom(headerRow[3]).hasText('t:sbomModule.knownVulnerabilities:()');

      const contentRows = findAll('[data-test-sbomScanComponent-row]');

      assert.strictEqual(contentRows.length, this.sbomScanComponents.length);

      // first row sanity check
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-sbomScanComponent-cell]'
      );

      assert.dom(firstRow[0]).hasText(this.sbomScanComponents[0].name);

      assert
        .dom(firstRow[1])
        .hasText(capitalize(this.sbomScanComponents[0].type));

      assert
        .dom('[data-test-sbomScanComponent-version]', firstRow[2])
        .hasText(this.sbomScanComponents[0].version);

      assert
        .dom('[data-test-sbomScanComponent-knownVulnerability]', firstRow[3])
        .hasText(
          this.sbomScanComponents[0].vulnerabilities_count > 0
            ? 'T:YES:()'
            : 'T:NO:()'
        );
    });

    test('it opens sbom scan component details drawer', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_components', (schema) => {
        const results = schema.sbomScanComponents.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
      <Sbom::ScanDetails::ComponentList 
        @sbomApp={{this.sbomApp}} 
        @sbomScan={{this.sbomScan}} 
        @sbomScanSummary={{this.sbomScanSummary}} 
        @queryParams={{this.queryParams}} 
      />
    `);

      const contentRows = findAll('[data-test-sbomScanComponent-row]');

      assert.strictEqual(contentRows.length, this.sbomScanComponents.length);

      await click(contentRows[2]);

      assert.dom('[data-test-componentDetails-container]').exists();
      assert.dom('[data-test-componentDetails-tabs]').exists();

      // Tests for the component details tab
      const componentDetailsTabs = [
        {
          id: 'component_details',
          label: 't:sbomModule.componentDetails:()',
        },
        {
          id: 'known_vulnerabilities',
          badgeCount: this.sbomScanComponents[2].vulnerabilities_count,
          hasBadge: true,
          label: 't:sbomModule.knownVulnerabilities:()',
        },
      ];

      componentDetailsTabs.forEach((tab) => {
        assert
          .dom(`[data-test-componentDetails-tab='${tab.id}']`)
          .exists()
          .containsText(tab.label);

        if (tab.hasBadge) {
          assert
            .dom(`[data-test-componentDetails-tab='${tab.id}']`)
            .containsText(`${tab.badgeCount}`);
        }
      });
    });

    test.skip('test sbom scan component list search', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_components', (schema, req) => {
        this.set('query', req.queryParams.q);

        const results = schema.sbomScanComponents.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
      <Sbom::ScanDetails::ComponentList 
        @sbomApp={{this.sbomApp}} 
        @sbomScan={{this.sbomScan}} 
        @sbomScanSummary={{this.sbomScanSummary}} 
        @queryParams={{this.queryParams}} 
      />
    `);

      assert.dom('[data-test-sbomScanComponent-searchInput]').hasNoValue();

      await fillIn('[data-test-sbomScanComponent-searchInput]', 'some query');
      await triggerEvent('[data-test-sbomScanComponent-searchInput]', 'keyup');

      assert
        .dom('[data-test-sbomScanComponent-searchInput]')
        .isNotDisabled()
        .hasValue(this.queryParams.component_query);

      assert.strictEqual(this.query, this.queryParams.component_query);
    });

    test('test sbom scan component version column', async function (assert) {
      this.sbomScanComponents[0].version = '1.0.0';

      this.sbomScanComponents[0].latest_version = '1.0.0';

      this.sbomScanComponents[1].version = '1.0.0';

      this.sbomScanComponents[1].latest_version = '2.0.0';

      this.server.get('/v2/sb_files/:scan_id/sb_components', () => {
        const results = this.sbomScanComponents;
        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
      <Sbom::ScanDetails::ComponentList 
        @sbomApp={{this.sbomApp}} 
        @sbomScan={{this.sbomScan}} 
        @sbomScanSummary={{this.sbomScanSummary}} 
        @queryParams={{this.queryParams}} 
      />
    `);

      const contentRows = findAll('[data-test-sbomScanComponent-row]');

      assert.strictEqual(contentRows.length, this.sbomScanComponents.length);

      // first row sanity check
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-sbomScanComponent-cell]'
      );

      assert
        .dom('[data-test-sbomScanComponent-version]', firstRow[2])
        .hasText(this.sbomScanComponents[0].version);

      assert
        .dom('[data-test-sbomScanComponent-versionOutdatedIcon]', firstRow[2])
        .doesNotExist();

      // second row sanity check
      const secondRow = contentRows[1].querySelectorAll(
        '[data-test-sbomScanComponent-cell]'
      );

      assert
        .dom('[data-test-sbomScanComponent-version]', secondRow[2])
        .hasText(this.sbomScanComponents[1].version);

      assert
        .dom('[data-test-sbomScanComponent-versionOutdatedIcon]', secondRow[2])
        .exists();

      assert.dom('[data-test-ak-tooltip-root]', secondRow[2]).exists();

      await triggerEvent(
        secondRow[2].querySelector('[data-test-ak-tooltip-root]'),
        'mouseenter'
      );

      assert
        .dom('[data-test-sbomScanComponent-versionOutdatedText]')
        .hasText('t:sbomModule.sbomComponentOutdated:()');
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
        @sbomApp={{this.sbomApp}} 
        @sbomScan={{this.sbomScan}} 
        @sbomScanSummary={{this.sbomScanSummary}} 
        @queryParams={{this.queryParams}} 
      />
    `);

      await waitFor('[data-test-sbomScanComponent-title]', { timeout: 500 });

      assert
        .dom('[data-test-sbomScanComponent-title]')
        .hasText('t:sbomModule.allComponents:()');

      // assert.dom('[data-test-sbomScanComponent-searchInput]').hasNoValue();

      assert.dom('[data-test-sbomScanComponent-table]').doesNotExist();

      assert.dom('[data-test-sbom-loadingSvg]').exists();

      assert.dom('[data-test-sbom-loader]').exists();
      assert.dom('[data-test-sbom-loadingText]').hasText('t:loading:()...');

      await waitFor('[data-test-sbomScanComponent-emptyTextTitle]', {
        timeout: 500,
      });

      assert
        .dom('[data-test-sbomScanComponent-emptyTextTitle]')
        .hasText('t:sbomModule.componentListEmptyText.title:()');

      assert
        .dom('[data-test-sbomScanComponent-emptyTextDescription]')
        .hasText('t:sbomModule.componentListEmptyText.description:()');

      assert.dom('[data-test-sbomScanComponent-emptySvg]').exists();
    });
  }
);
