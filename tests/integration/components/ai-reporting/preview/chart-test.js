import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import * as echarts from 'echarts/core';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

const COLUMNS = [
  { field: 'risk', label: 'Severity', type: 'string', is_default: true },
  { field: 'findings', label: 'Findings', type: 'integer', is_default: true },
  { field: 'apps', label: 'Apps', type: 'integer', is_default: true },
];

const BAR_CHART = { type: 'bar', x: 'risk', y: ['findings'], series: null };

const BAR_ROWS = [
  { risk: 'High', findings: 4 },
  { risk: 'Low', findings: 1 },
];

module(
  'Integration | Component | ai-reporting/preview/chart',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        columns: COLUMNS,
        kind: null,
        onKindChange: (kind) => this.set('kind', kind),
      });
    });

    test('it renders a tile per total for a number chart', async function (assert) {
      this.setProperties({
        chart: {
          type: 'number',
          x: null,
          y: ['findings', 'apps'],
          series: null,
        },
        rows: [{ findings: 42, apps: 3 }],
      });

      await render(hbs`
        <AiReporting::Preview::Chart @chart={{this.chart}} @rows={{this.rows}} @columns={{this.columns}} />
      `);

      assert
        .dom('[data-test-aiReporting-preview-chart-tile="findings"]')
        .containsText('Findings')
        .containsText('42');

      assert
        .dom('[data-test-aiReporting-preview-chart-tile="apps"]')
        .containsText('Apps')
        .containsText('3');

      assert.dom('[data-test-aiReporting-preview-chart-canvas]').doesNotExist();

      assert
        .dom('[data-test-aiReporting-preview-chart-kind="number"]')
        .hasAttribute('aria-pressed', 'true', 'several totals can switch');
    });

    test('a single number has no chart kinds to pick', async function (assert) {
      this.setProperties({
        chart: { type: 'number', x: null, y: ['findings'], series: null },
        rows: [{ findings: 42 }],
      });

      await render(hbs`
        <AiReporting::Preview::Chart @chart={{this.chart}} @rows={{this.rows}} @columns={{this.columns}} />
      `);

      assert.dom('[data-test-aiReporting-preview-chart-kinds]').doesNotExist();
    });

    test('it draws the report chart and offers the kinds that fit', async function (assert) {
      this.setProperties({ chart: BAR_CHART, rows: BAR_ROWS });

      await render(hbs`
        <AiReporting::Preview::Chart
          @chart={{this.chart}}
          @rows={{this.rows}}
          @columns={{this.columns}}
          @kind={{this.kind}}
          @onKindChange={{this.onKindChange}}
        />
      `);

      assert
        .dom('[data-test-aiReporting-preview-chart-canvas] canvas')
        .exists();

      const kinds = ['bar', 'row', 'line', 'area', 'pie'];

      kinds.forEach((kind) => {
        assert
          .dom(`[data-test-aiReporting-preview-chart-kind="${kind}"]`)
          .hasText(t(`reportModule.chartKinds.${kind}`));
      });

      assert
        .dom('[data-test-aiReporting-preview-chart-kind="bar"]')
        .hasAttribute('aria-pressed', 'true', 'the report default is active');
    });

    test('picking a kind reports it and marks it active', async function (assert) {
      this.setProperties({ chart: BAR_CHART, rows: BAR_ROWS });

      await render(hbs`
        <AiReporting::Preview::Chart
          @chart={{this.chart}}
          @rows={{this.rows}}
          @columns={{this.columns}}
          @kind={{this.kind}}
          @onKindChange={{this.onKindChange}}
        />
      `);

      await click('[data-test-aiReporting-preview-chart-kind="pie"]');

      assert.strictEqual(this.kind, 'pie');

      assert
        .dom('[data-test-aiReporting-preview-chart-kind="pie"]')
        .hasAttribute('aria-pressed', 'true');

      assert
        .dom('[data-test-aiReporting-preview-chart-kind="bar"]')
        .hasAttribute('aria-pressed', 'false');

      const instance = echarts.getInstanceByDom(
        find('[data-test-aiReporting-preview-chart-canvas]')
      );

      const { series, xAxis } = instance.getOption();

      assert.strictEqual(
        series[0].type,
        'pie',
        'the chart is redrawn as a pie'
      );
      assert.notOk(xAxis?.length, 'the bar axes are gone, not merged in');
    });
  }
);
