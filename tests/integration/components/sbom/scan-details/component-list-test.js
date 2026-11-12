import { click, render, findAll, find, waitFor } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { capitalize } from '@ember/string';
import { reachabilityLabelKey } from 'irene/utils/sbom-reachability';

module(
  'Integration | Component | sbom/scan-details/component-list',
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

      const sbomComponents = this.server.createList('sbom-component', 10);

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
        sbomComponents,
        sbomService,
        store,
      });
    });

    test('it renders sbom scan component list', async function (assert) {
      await render(hbs`
        <Sbom::ScanDetails::ComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      assert.dom('[data-test-sbomComponent-table]').exists();

      const headerRow = find(
        '[data-test-sbomComponent-thead] tr'
      ).querySelectorAll('th');

      // assert header row
      assert.dom(headerRow[0]).hasText(t('sbomModule.componentName'));
      assert.dom(headerRow[1]).hasText(t('sbomModule.componentType'));
      assert.dom(headerRow[2]).hasText(t('dependencyType'));
      assert.dom(headerRow[3]).hasText(t('status'));
      assert.dom(headerRow[4]).hasText(t('sbomModule.reachability.title'));

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
        .dom('[data-test-sbomComponent-dependencyType]', firstRow[2])
        .exists();

      if (sbomComponent.isDependency) {
        assert
          .dom('[data-test-sbomComponent-dependencyType]', firstRow[2])
          .hasText(t('dependencyTypes.transitive'));
      } else {
        assert
          .dom('[data-test-sbomComponent-dependencyType]', firstRow[2])
          .hasText(t('dependencyTypes.direct'));
      }

      if (sbomComponent.isOutdated) {
        assert
          .dom(
            `[data-test-sbomComponent-status="${t('chipStatus.outdated')}"]`,
            firstRow[3]
          )
          .hasText(t('chipStatus.outdated'));
      }

      if (sbomComponent.isVulnerable) {
        assert
          .dom(
            `[data-test-sbomComponent-status="${t('chipStatus.vulnerable')}"]`,
            firstRow[3]
          )
          .hasText(t('chipStatus.vulnerable'));
      } else {
        assert
          .dom(
            `[data-test-sbomComponent-status="${t('chipStatus.secure')}"]`,
            firstRow[3]
          )
          .hasText(t('chipStatus.secure'));
      }

      assert
        .dom('[data-test-sbomComponent-reachability]', firstRow[4])
        .exists();

      assert
        .dom('[data-test-sbomReachability-status]', firstRow[4])
        .hasText(t(reachabilityLabelKey(sbomComponent.reachability?.verdict)));
    });

    test('test sbom scan component outdated version', async function (assert) {
      this.sbomComponents[0].version = '1.0.0';

      this.sbomComponents[0].latest_version = '1.0.0';

      this.sbomComponents[1].version = '1.0.0';

      this.sbomComponents[1].latest_version = '2.0.0';

      this.server.get('/v2/sb_files/:scan_id/sb_file_components', () => {
        const results = this.sbomComponents;

        return { count: results.length, next: null, previous: null, results };
      });

      this.sbomService.reload();

      await render(hbs`
        <Sbom::ScanDetails::ComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      const contentRows = findAll('[data-test-sbomComponent-row]');

      assert.strictEqual(contentRows.length, this.sbomComponents.length);

      // first row sanity check
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-sbomComponent-cell]'
      );

      assert
        .dom(
          `[data-test-sbomComponent-status="${t('chipStatus.outdated')}"]`,
          firstRow[3]
        )
        .doesNotExist();

      // second row sanity check
      const secondRow = contentRows[1].querySelectorAll(
        '[data-test-sbomComponent-cell]'
      );

      assert
        .dom(
          `[data-test-sbomComponent-status="${t('chipStatus.outdated')}"]`,
          secondRow[3]
        )
        .hasText(t('chipStatus.outdated'));
    });

    test('it renders sbom scan component list loading & empty state', async function (assert) {
      this.server.get(
        '/v2/sb_files/:scan_id/sb_file_components',
        () => {
          return { count: 0, next: null, previous: null, results: [] };
        },
        { timing: 500 }
      );

      this.sbomService.reload();

      render(hbs`
        <Sbom::ScanDetails::ComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
        />
      `);

      await waitFor('[data-test-component-list-skeleton-loader]', {
        timeout: 500,
      });

      // assert.dom('[data-test-sbomComponent-searchInput]').hasNoValue();

      assert.dom('[data-test-sbomComponent-table]').doesNotExist();

      await waitFor('[data-test-sbomComponent-emptyTextTitle]', {
        timeout: 500,
      });

      assert
        .dom('[data-test-sbomComponent-emptyTextTitle]')
        .hasText(t('sbomModule.componentListEmptyText.title'));

      assert
        .dom('[data-test-sbomComponent-emptyTextDescription]')
        .hasText(t('sbomModule.componentListEmptyText.description'));

      assert.dom('[data-test-sbomComponent-emptySvg]').exists();
    });

    test.each(
      'row click opens the screen that matches the active tab',
      [
        {
          view: 'complete',
          route: 'authenticated.dashboard.sbom.component-details.overview',
        },
        {
          view: 'insights',
          route: 'authenticated.dashboard.sbom.component-insights',
        },
      ],
      async function (assert, { view, route }) {
        const router = this.owner.lookup('service:router');
        const calls = [];

        router.transitionTo = (...args) => {
          calls.push(args);
        };

        this.set('view', view);

        await render(hbs`
          <Sbom::ScanDetails::ComponentList
            @sbomProject={{this.sbomProject}}
            @sbomFile={{this.sbomFile}}
            @sbomScanSummary={{this.sbomScanSummary}}
            @view={{this.view}}
          />
        `);

        await click('[data-test-sbomComponent-row]');

        const rowCall = calls.find((args) => typeof args[0] === 'string');

        const expected = [
          route,
          this.sbomProject.id,
          this.sbomFile.id,
          String(this.sbomComponents[0].id),
          0,
        ];

        if (view === 'insights') {
          // Opening a row must not inherit a previously paged-to `vuln`.
          expected.push({ queryParams: { vuln: null } });
        }

        assert.deepEqual(rowCall, expected);
      }
    );

    test('insights empty state explains the finding and links to the complete analysis', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_file_components', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      this.sbomService.reload();

      this.clicks = 0;
      this.onViewComplete = () => (this.clicks += 1);

      await render(hbs`
        <Sbom::ScanDetails::ComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
          @view='insights'
          @showReachability={{true}}
          @onViewComplete={{this.onViewComplete}}
        />
      `);

      assert
        .dom('[data-test-sbomComponent-insightsEmptyTitle]')
        .hasText(t('sbomModule.reachabilityInsights.emptyTitle'));

      assert
        .dom('[data-test-sbomComponent-insightsEmptyDescription]')
        .hasText(t('sbomModule.reachabilityInsights.emptyDescription'));

      assert.dom('[data-test-sbomComponent-emptySvg]').exists();
      assert.dom('[data-test-sbomComponent-emptyTextTitle]').doesNotExist();

      // one clean container: no table or pagination, a single empty view
      assert.dom('[data-test-sbomComponent-table]').doesNotExist();
      assert.dom('[data-test-sbom-emptyLoadingView]').exists({ count: 1 });

      assert
        .dom(
          '[data-test-sbom-emptyLoadingView] [data-test-sbomComponent-insightsEmptyViewComplete]'
        )
        .isVisible();

      await click('[data-test-sbomComponent-insightsEmptyViewComplete]');

      assert.strictEqual(this.clicks, 1);
    });

    test('complete view keeps the generic empty state', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_file_components', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      this.sbomService.reload();

      await render(hbs`
        <Sbom::ScanDetails::ComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
          @view='complete'
          @showReachability={{true}}
        />
      `);

      assert
        .dom('[data-test-sbomComponent-emptyTextTitle]')
        .hasText(t('sbomModule.componentListEmptyText.title'));

      assert
        .dom('[data-test-sbomComponent-insightsEmptyViewComplete]')
        .doesNotExist();
    });

    test('insights view with a search query keeps the no-match text', async function (assert) {
      this.server.get('/v2/sb_files/:scan_id/sb_file_components', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      this.sbomService.setQueryData({
        view_type: 'list',
        component_type: -1,
        is_dependency: null,
        component_query: 'zzz',
        sbomFile: this.sbomFile,
      });

      await this.sbomService.reload();

      await render(hbs`
        <Sbom::ScanDetails::ComponentList
          @sbomProject={{this.sbomProject}}
          @sbomFile={{this.sbomFile}}
          @sbomScanSummary={{this.sbomScanSummary}}
          @view='insights'
          @showReachability={{true}}
        />
      `);

      assert
        .dom('[data-test-sbomComponent-emptyTextTitle]')
        .hasText(t('sbomModule.noComponentsMatch', { query: 'zzz' }));

      assert.dom('[data-test-sbomComponent-insightsEmptyTitle]').doesNotExist();

      assert
        .dom('[data-test-sbomComponent-insightsEmptyViewComplete]')
        .doesNotExist();
    });

    test.each(
      'the via line shows on Insights rows only',
      [
        { view: 'complete', shown: false },
        { view: 'insights', shown: true },
      ],
      async function (assert, { view, shown }) {
        this.server.create('sbom-component', {
          is_dependency: true,
          via: 'okhttp',
        });

        await this.sbomService.reload();

        this.view = view;

        await render(hbs`
          <Sbom::ScanDetails::ComponentList
            @sbomProject={{this.sbomProject}}
            @sbomFile={{this.sbomFile}}
            @sbomScanSummary={{this.sbomScanSummary}}
            @view={{this.view}}
            @showReachability={{true}}
          />
        `);

        assert.strictEqual(
          findAll('[data-test-sbomComponent-dependencyVia]').length > 0,
          shown
        );
      }
    );
  }
);
