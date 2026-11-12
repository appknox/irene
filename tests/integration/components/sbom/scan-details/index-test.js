import {
  render,
  click,
  fillIn,
  find,
  findAll,
  settled,
} from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomScanStatus } from 'irene/models/sbom-file';
import { ReachabilityScanStatus } from 'irene/utils/sbom-reachability';

module('Integration | Component | sbom/scan-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const file = this.server.create('file', 1);
    const project = this.server.create('project', 1, { last_file: file });
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
        view_type: 'tree',
        component_type: -1,
        is_dependency: null,
      },
    });

    // Server mock
    this.server.get('/v3/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v3/files/:id', (schema, req) => {
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

      this.server.get('/v2/sb_files/:id/sb_file_components', (schema) => {
        const results = schema.sbomComponents.all().models;

        return {
          count: results.length,
          next: null,
          previous: null,
          results: results,
        };
      });

      await render(hbs`
        <Sbom::ScanDetails
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
          @queryParams={{this.queryParams}}
        />
      `);

      // assert.dom('[data-test-sbomScanDetails-componentSearchInput]').hasNoValue();

      assert.dom('[data-test-sbomScanDetails-container]').exists();

      assert
        .dom('[data-test-sbomScanDetails-pastSbomAnalyses-link]')
        .exists()
        .hasText(t('sbomModule.pastSbomAnalyses'));

      if (status === SbomScanStatus.COMPLETED) {
        assert
          .dom('[data-test-sbomScanDetails-viewReport-btn]')
          .exists()
          .containsText(t('sbomModule.viewReport'));
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
        assert.dom('[data-test-component-tree]').exists();
      } else {
        if (status === SbomScanStatus.FAILED) {
          assert
            .dom('[data-test-sbomScanDetails-scanStatusFailedSvg]')
            .exists();

          assert
            .dom('[data-test-sbomScanDetails-scanStatusTitle]')
            .hasText(t('sbomModule.sbomScanStatusError.title'));

          assert
            .dom('[data-test-sbomScanDetails-scanStatusDescription]')
            .hasText(t('sbomModule.sbomScanStatusError.description'));
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
            .hasText(t('sbomModule.sbomScanStatusProgress.title'));

          assert
            .dom('[data-test-sbomScanDetails-scanStatusDescription]')
            .hasText(t('sbomModule.sbomScanStatusProgress.description'));
        }
      }

      assert.dom('[data-test-sbomReportDrawer-drawer]').doesNotExist();
    }
  );

  test('it toggles file and scan summary on header toggle collapse button click', async function (assert) {
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
        label: t('status'),
        isComponent: true,
        assertValue: () =>
          assert.dom('[data-test-sbom-scanStatus]').hasAnyText(),
      },
      {
        label: t('sbomModule.generatedDate'),
        value: dayjs(this.sbomFile.completedAt).format('MMM DD, YYYY'),
      },
      {
        label: t('version'),
        value: this.sbomFile.get('file').get('version'),
      },
      {
        label: t('sbomModule.versionCode'),
        value: this.sbomFile.get('file').get('versionCode'),
      },
      {
        label: t('file'),
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

      if (fileSummary.isComponent && fileSummary.assertValue) {
        fileSummary.assertValue();
      } else if (fileSummary.link) {
        assert
          .dom(
            `[data-test-sbomScanDetails-fileSummaryGroup="${fileSummary.label}"] [data-test-sbomScanDetails-fileSummaryGroup-link]`
          )
          .exists()
          .hasText(fileSummary.value);
      } else {
        assert
          .dom(
            `[data-test-sbomScanDetails-fileSummaryGroup="${fileSummary.label}"] [data-test-sbomScanDetails-fileSummaryGroup-value]`
          )
          .exists()
          .hasText(fileSummary.value);
      }
    }

    // Collapse file and scan summary
    await click('[data-test-sbomSummaryHeader-collapsibleToggleBtn]');

    assert.dom('[data-test-fileScanSummary-container]').doesNotExist();
  });

  test('it launches download report drawer on download report button click', async function (assert) {
    this.sbomFile.status = SbomScanStatus.COMPLETED;

    this.server.get('/v2/sb_files/:id/sb_file_components', (schema) => {
      const results = schema.sbomComponents.all().models;

      return {
        count: results.length,
        next: null,
        previous: null,
        results: results,
      };
    });

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

  module('reachability tabs', function (nestedHooks) {
    const TEMPLATE = hbs`
      <Sbom::ScanDetails
        @sbomProject={{this.sbomProject}}
        @sbomFile={{this.sbomFile}}
        @sbomScanSummary={{this.sbomScanSummary}}
        @queryParams={{this.queryParams}}
        @tab={{this.tab}}
      />
    `;

    nestedHooks.beforeEach(function () {
      const transitions = [];
      const requests = [];

      this.transitions = transitions;
      this.requests = requests;

      const replacements = [];

      this.replacements = replacements;

      const router = this.owner.lookup('service:router');

      router.transitionTo = (arg) => {
        transitions.push(arg?.queryParams);
      };

      router.replaceWith = (...args) => {
        replacements.push(args.at(-1)?.queryParams);
      };

      this.sbomFile.status = SbomScanStatus.COMPLETED;
      this.sbomFile.reachabilityStatus = ReachabilityScanStatus.COMPLETED;

      this.server.get('/v2/sb_files/:id/sb_file_components', (schema, req) => {
        requests.push(req.queryParams);

        const results = schema.sbomComponents.all().models;

        return { count: results.length, next: null, previous: null, results };
      });
    });

    const headerTexts = () =>
      findAll('[data-test-sbomComponent-thead] th').map((th) =>
        th.textContent.trim()
      );

    test('it lands on Reachability insights, the first tab, by default', async function (assert) {
      await render(TEMPLATE);

      assert.dom('[data-test-sbomScanDetails-tabs]').exists();

      const insightsTab = find('[data-test-sbomScanDetails-insightsTab]');
      const completeTab = find('[data-test-sbomScanDetails-completeTab]');

      assert.ok(
        insightsTab.compareDocumentPosition(completeTab) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        'insights is the first tab'
      );

      assert.strictEqual(this.requests[0].has_reachability, 'true');
      assert.dom('[data-test-sbomScanDetails-viewTitle]').doesNotExist();

      assert
        .dom('[data-test-sbomScanDetails-componentSearchInput]')
        .exists('search shows on insights when there are findings');

      assert
        .dom('[data-test-sbomScanDetails-switch-treeViewButton]')
        .doesNotExist();
    });

    test('it opens Complete analysis from ?tab=complete with the component count', async function (assert) {
      this.queryParams = {
        ...this.queryParams,
        view_type: 'list',
        tab: 'complete',
      };

      await render(TEMPLATE);

      assert.dom('[data-test-sbomScanDetails-tabs]').exists();

      assert
        .dom('[data-test-sbomScanDetails-completeTab]')
        .containsText(t('sbomModule.completeAnalysis.tab'));

      assert
        .dom('[data-test-sbomScanDetails-completeTab] [data-test-ak-tab-badge]')
        .hasText(String(this.sbomScanSummary.componentCount));

      assert
        .dom('[data-test-sbomScanDetails-insightsTab]')
        .hasText(t('sbomModule.reachabilityInsights.tab'));

      assert.dom('[data-test-sbomScanDetails-viewTitle]').doesNotExist();
      assert.dom('[data-test-sbomScanDetails-viewSubtitle]').doesNotExist();

      // The old text links are gone.
      assert
        .dom('[data-test-sbomScanDetails-originalAnalysis-link]')
        .doesNotExist();

      assert
        .dom('[data-test-sbomScanDetails-backToInsights-link]')
        .doesNotExist();

      assert.notOk(
        'has_reachability' in this.requests[0],
        'complete list is not filtered'
      );

      // Complete tab keeps the type column and the tree/list toggle.
      assert.deepEqual(headerTexts(), [
        t('sbomModule.componentName'),
        t('sbomModule.componentType'),
        t('dependencyType'),
        t('status'),
        t('sbomModule.reachability.title'),
      ]);

      assert.dom('[data-test-sbomScanDetails-switch-treeViewButton]').exists();
    });

    test('it opens Reachability insights from the tab deep link', async function (assert) {
      this.queryParams = { ...this.queryParams, tab: 'insights' };

      await render(TEMPLATE);

      assert.dom('[data-test-sbomScanDetails-viewTitle]').doesNotExist();
      assert.dom('[data-test-sbomScanDetails-viewSubtitle]').doesNotExist();

      assert.strictEqual(this.requests[0].has_reachability, 'true');

      assert.deepEqual(headerTexts(), [
        t('sbomModule.componentName'),
        t('status'),
        t('sbomModule.reachabilityInsights.title'),
        t('dependencyType'),
      ]);

      assert
        .dom('[data-test-sbomScanDetails-switch-treeViewButton]')
        .doesNotExist();

      const component = this.server.db.sbomComponents[0];

      assert
        .dom('[data-test-sbomComponent-purl]')
        .exists()
        .hasText(`${component.bom_ref}@${component.version}`);
    });

    test('it switches tabs and resets the list query', async function (assert) {
      this.queryParams = { ...this.queryParams, view_type: 'list' };

      await render(TEMPLATE);

      await click('[data-test-sbomScanDetails-completeTab] button');

      const toComplete = this.transitions.at(-1);

      assert.strictEqual(toComplete.tab, 'complete');
      assert.strictEqual(toComplete.view_type, 'list', 'restores list mode');
      assert.strictEqual(toComplete.component_offset, 0);
      assert.notOk('has_reachability' in this.requests.at(-1));

      await click('[data-test-sbomScanDetails-insightsTab] button');

      const toInsights = this.transitions.at(-1);

      assert.strictEqual(toInsights.tab, null, 'insights is the default');
      assert.strictEqual(toInsights.view_type, 'list');
      assert.strictEqual(this.requests.at(-1).has_reachability, 'true');
    });

    test('it echoes the search term when nothing matches', async function (assert) {
      // search is hidden on an empty insights tab, so search on Complete
      this.queryParams = {
        ...this.queryParams,
        tab: 'complete',
        view_type: 'list',
      };

      this.server.get('/v2/sb_files/:id/sb_file_components', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      await render(TEMPLATE);

      await fillIn('[data-test-sbomScanDetails-componentSearchInput]', 'zzz');

      assert
        .dom('[data-test-sbomComponent-emptyTextTitle]')
        .hasText(t('sbomModule.noComponentsMatch', { query: 'zzz' }));

      assert.dom('[data-test-sbomComponent-emptySvg]').exists();
    });

    test('it hides the search and toolbar on an empty insights tab', async function (assert) {
      this.server.get('/v2/sb_files/:id/sb_file_components', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      this.queryParams = { ...this.queryParams, tab: 'insights' };

      await render(TEMPLATE);

      assert
        .dom('[data-test-sbomScanDetails-componentSearchInput]')
        .doesNotExist();

      assert.dom('[data-test-sbomScanDetails-switch-header]').doesNotExist();
    });

    test('it keeps the search on insights when a query matches nothing', async function (assert) {
      this.queryParams = { ...this.queryParams, tab: 'insights' };

      await render(TEMPLATE);

      this.server.get('/v2/sb_files/:id/sb_file_components', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      await fillIn('[data-test-sbomScanDetails-componentSearchInput]', 'zzz');

      assert
        .dom('[data-test-sbomScanDetails-componentSearchInput]')
        .exists()
        .hasValue('zzz');
    });

    test('View complete analysis on the empty insights list opens the Complete tab', async function (assert) {
      this.server.get('/v2/sb_files/:id/sb_file_components', (schema, req) => {
        this.requests.push(req.queryParams);

        return { count: 0, next: null, previous: null, results: [] };
      });

      this.queryParams = { ...this.queryParams, tab: 'insights' };

      await render(TEMPLATE);

      await click('[data-test-sbomComponent-insightsEmptyViewComplete]');

      assert.strictEqual(this.transitions.at(-1).tab, 'complete');
      assert.notOk('has_reachability' in this.requests.at(-1));
    });

    // A failed run is terminal, so no polling interferes; pending runs poll.
    test('it lands on Complete when the reachability run failed', async function (assert) {
      this.sbomFile.reachabilityStatus = ReachabilityScanStatus.FAILED;

      await render(TEMPLATE);

      assert.notOk('has_reachability' in this.requests[0]);

      assert.dom('[data-test-sbomScanDetails-switch-treeViewButton]').exists();
    });

    test('it hides the tabs when reachability did not run', async function (assert) {
      this.sbomFile.reachabilityStatus = null;
      this.queryParams = { ...this.queryParams, tab: 'complete' };

      await render(TEMPLATE);

      assert.dom('[data-test-sbomScanDetails-tabs]').doesNotExist();
      assert.dom('[data-test-sbomScanDetails-viewTitle]').doesNotExist();
      assert.notOk('has_reachability' in this.requests[0]);

      // The stale `complete` tab is dropped from the URL.
      assert.deepEqual(this.replacements, [{ tab: null }]);
    });

    test('it follows the tab query param when it changes after render', async function (assert) {
      this.queryParams = { ...this.queryParams, view_type: 'list' };
      this.tab = null;

      await render(TEMPLATE);

      assert.strictEqual(this.requests.at(-1).has_reachability, 'true');

      // e.g. browser Forward to `?tab=complete`.
      this.set('tab', 'complete');
      await settled();

      assert.notOk('has_reachability' in this.requests.at(-1));
      assert.strictEqual(this.transitions.length, 0, 'the URL is not pushed');

      // e.g. browser Back to the bare URL.
      this.set('tab', null);
      await settled();

      assert.strictEqual(this.requests.at(-1).has_reachability, 'true');
    });

    test('search sits left of the toolbar and hides in the complete tree view', async function (assert) {
      this.queryParams = {
        ...this.queryParams,
        view_type: 'tree',
        tab: 'complete',
      };

      await render(TEMPLATE);

      assert
        .dom('[data-test-sbomScanDetails-componentSearchInput]')
        .doesNotExist('no search in tree view');

      assert.dom('[data-test-sbomScanDetails-switch-treeViewButton]').exists();

      await click('[data-test-sbomScanDetails-switch-listViewButton]');

      const search = find('[data-test-sbomScanDetails-componentSearchInput]');
      const toggle = find('[data-test-sbomScanDetails-switch-listViewButton]');

      assert.ok(search, 'search shows in list view');

      assert.ok(
        search.compareDocumentPosition(toggle) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        'search is left of the view toggle'
      );
    });

    test('switching tabs clears the search field', async function (assert) {
      this.queryParams = { ...this.queryParams, view_type: 'list' };

      await render(TEMPLATE);

      await fillIn('[data-test-sbomScanDetails-componentSearchInput]', 'jack');

      assert
        .dom('[data-test-sbomScanDetails-componentSearchInput]')
        .hasValue('jack');

      await click('[data-test-sbomScanDetails-completeTab] button');

      assert
        .dom('[data-test-sbomScanDetails-componentSearchInput]')
        .hasValue('');
      assert.notOk('q' in this.requests.at(-1), 'search is not sent');
    });
  });
});
