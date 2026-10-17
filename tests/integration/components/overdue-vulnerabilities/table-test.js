import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

class RouterStub extends Service {
  transitionedTo = null;
  urlForCalledWith = null;

  transitionTo(...args) {
    this.transitionedTo = args;
  }

  urlFor(...args) {
    this.urlForCalledWith = args;

    return `/${args.join('/')}`;
  }
}

class WindowStub extends Service {
  openedWith = null;

  open(...args) {
    this.openedWith = args;
  }
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  loading: '[data-test-overdueVulnerabilities-table-loading]',
  table: '[data-test-overdueVulnerabilities-table]',
  headerCells: '[data-test-overdueVulnerabilities-table-headerCell]',
  sortIcon: '[data-test-overdueVulnerabilities-table-sortIcon]',
  rows: '[data-test-overdueVulnerabilities-table-row]',
  row: (id) => `[data-test-overdueVulnerabilities-table-row="${id}"]`,
  name: '[data-test-overdueVulnerabilities-table-name]',
  severity: '[data-test-overdueVulnerabilities-table-severity]',
  overdueByText: '[data-test-overdueVulnerabilities-table-overdueByText]',
  firstFoundOn: '[data-test-overdueVulnerabilities-table-firstFoundOn]',
  fileLink: '[data-test-overdueVulnerabilities-table-fileLink]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<OverdueVulnerabilities::Table
  @loading={{this.loading}}
  @rows={{this.rows}}
  @ordering={{this.ordering}}
  @onOrderingChange={{this.onOrderingChange}}
/>`;

const HEADER_KEYS = [
  'overdueVulnerabilities.nameOfVulnerability',
  'severity',
  'overdueVulnerabilities.overdueBy',
  'overdueVulnerabilities.firstFoundOn',
];

const overdueDays = (row) =>
  Math.max(dayjs().diff(row.remediationDeadline, 'day'), 0);

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | overdue-vulnerabilities/table',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:browser/window', WindowStub);

      this.server.createList('organization', 1);
      this.server.createList('organization-me', 1);

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      const store = this.owner.lookup('service:store');

      const push = (record) =>
        store.push(
          store.normalize('project-overdue-vulnerability', record.toJSON())
        );

      this.setProperties({
        push,
        rows: this.server
          .createList('project-overdue-vulnerability', 3)
          .map(push),
        loading: false,
        ordering: '-severity',
        orderingChangedTo: null,
        onOrderingChange: (ordering) => this.set('orderingChangedTo', ordering),
        router: this.owner.lookup('service:router'),
        window: this.owner.lookup('service:browser/window'),
      });
    });

    // ─── Rendering ───────────────────────────────────────────────────────────
    test('it renders the loading table while loading', async function (assert) {
      this.set('loading', true);

      await render(TEMPLATE);

      assert.dom(selectors.loading).exists();
      assert.dom(selectors.table).doesNotExist();
    });

    test('it renders the column headers', async function (assert) {
      await render(TEMPLATE);

      const headers = findAll(selectors.headerCells);

      assert.strictEqual(headers.length, HEADER_KEYS.length);

      HEADER_KEYS.forEach((key, i) => {
        assert.dom(headers[i]).containsText(t(key));
      });
    });

    test('it renders every overdue vulnerability', async function (assert) {
      await render(TEMPLATE);

      const rows = findAll(selectors.rows);

      assert.strictEqual(rows.length, this.rows.length);

      this.rows.forEach((row, i) => {
        assert.dom(selectors.name, rows[i]).hasText(row.vulnerabilityName);

        assert
          .dom(selectors.severity, rows[i])
          .hasText(
            analysisRiskStatus([
              row.computedRisk,
              ENUMS.ANALYSIS.COMPLETED,
              false,
            ]).label
          );

        assert.dom(selectors.overdueByText, rows[i]).hasText(
          t('overdueVulnerabilities.overdueDays', {
            count: overdueDays(row),
          })
        );

        assert
          .dom(selectors.firstFoundOn, rows[i])
          .hasText(dayjs(row.firstFoundOn).format('MMM DD, YYYY'));

        assert
          .dom(selectors.fileLink, rows[i])
          .hasText(`${t('fileID')} - ${row.fileId}`)
          .hasAttribute('href', new RegExp(`/dashboard/file/${row.fileId}$`));
      });
    });

    test('it renders a dash when the first found date is unknown', async function (assert) {
      const record = this.server.create('project-overdue-vulnerability', {
        first_found_on: null,
      });

      this.set('rows', [this.push(record)]);

      await render(TEMPLATE);

      assert.dom(selectors.firstFoundOn).hasText('-');
    });

    // ─── Sorting ─────────────────────────────────────────────────────────────
    test('it shows the sort arrow on the ordered column', async function (assert) {
      await render(TEMPLATE);

      const headers = findAll(selectors.headerCells);

      assert
        .dom(selectors.sortIcon, headers[1])
        .hasAttribute('icon', /arrow-downward/);

      assert.dom(selectors.sortIcon, headers[2]).doesNotExist();
    });

    test.each(
      'clicking a sortable header requests the flipped ordering',
      [
        ['-severity', 1, 'severity'],
        ['severity', 1, '-severity'],
        ['-severity', 2, 'overdue_by'],
      ],
      async function (assert, [ordering, headerIdx, expected]) {
        this.set('ordering', ordering);

        await render(TEMPLATE);

        assert.strictEqual(this.orderingChangedTo, null);

        await click(findAll(selectors.headerCells)[headerIdx]);

        assert.strictEqual(this.orderingChangedTo, expected);
      }
    );

    // ─── Row navigation ──────────────────────────────────────────────────────
    test.each(
      'clicking a row opens the matching analysis page',
      [
        [[], 'authenticated.dashboard.file.analysis'],
        [
          ['withKnoxiqExploitability'],
          'authenticated.dashboard.file.knox-analysis',
        ],
        [
          ['withKnoxiqAllFalsePositive'],
          'authenticated.dashboard.file.knox-analysis',
        ],
      ],
      async function (assert, [traits, route]) {
        const row = this.push(
          this.server.create('project-overdue-vulnerability', ...traits)
        );

        this.set('rows', [row]);

        await render(TEMPLATE);

        assert.strictEqual(this.router.transitionedTo, null);

        await click(selectors.name);

        assert.deepEqual(this.router.transitionedTo, [
          route,
          String(row.fileId),
          String(row.analysisId),
        ]);
      }
    );

    test('ctrl-clicking a row opens the analysis in a new tab', async function (assert) {
      const [row] = this.rows;

      await render(TEMPLATE);

      await click(`${selectors.row(row.id)} ${selectors.name}`, {
        ctrlKey: true,
      });

      assert.strictEqual(this.router.transitionedTo, null);

      assert.deepEqual(this.window.openedWith, [
        this.router.urlFor(
          'authenticated.dashboard.file.analysis',
          String(row.fileId),
          String(row.analysisId)
        ),
        '_blank',
      ]);
    });

    test('clicking a row without an analysis does nothing', async function (assert) {
      const row = this.push(
        this.server.create('project-overdue-vulnerability', 'withoutAnalysis')
      );

      this.set('rows', [row]);

      await render(TEMPLATE);

      await click(selectors.name);

      assert.strictEqual(this.router.transitionedTo, null);
    });
  }
);
