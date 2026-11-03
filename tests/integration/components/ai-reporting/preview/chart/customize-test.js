import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import * as echarts from 'echarts/core';

import { defaultChartSettings } from 'irene/utils/ai-reporting/report-chart-settings';

const COLUMNS = [
  { field: 'risk', label: 'Severity', type: 'string', is_default: true },
  { field: 'findings', label: 'Findings', type: 'integer', is_default: true },
];

const BAR_CHART = { type: 'bar', x: 'risk', y: ['findings'], series: null };

const ROWS = [
  { risk: 'High', findings: 4 },
  { risk: 'Low', findings: 1 },
];

/** Renders the chart with this test's chart, rows and settings. */
function renderChart() {
  return render(hbs`
    <AiReporting::Preview::Chart
      @chart={{this.chart}}
      @rows={{this.rows}}
      @columns={{this.columns}}
      @kind={{this.kind}}
      @onKindChange={{this.onKindChange}}
      @settings={{this.settings}}
      @onSettingsChange={{this.onSettingsChange}}
      @onSettingsReset={{this.onSettingsReset}}
    />
  `);
}

function drawnOption() {
  return echarts
    .getInstanceByDom(find('[data-test-aiReporting-preview-chart-canvas]'))
    .getOption();
}

module(
  'Integration | Component | ai-reporting/preview/chart/customize',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        chart: BAR_CHART,
        rows: ROWS,
        columns: COLUMNS,
        kind: null,
        settings: defaultChartSettings(),
        resets: 0,
        onKindChange: (kind) => this.set('kind', kind),
        onSettingsChange: (settings) => this.set('settings', settings),
        onSettingsReset: () => {
          this.set('resets', this.resets + 1);
          this.set('settings', defaultChartSettings());
        },
      });
    });

    test('Customize opens a panel with Data, Display and Axes tabs beside the chart', async function (assert) {
      await renderChart();

      assert.dom('[data-test-aiReporting-chartCustomize]').doesNotExist();

      await click('[data-test-aiReporting-preview-chart-customizeBtn]');

      assert.dom('[data-test-aiReporting-chartCustomize]').exists();
      assert
        .dom('[data-test-aiReporting-preview-chart-canvas] canvas')
        .exists();

      ['data', 'display', 'axes'].forEach((tab) => {
        assert
          .dom(`[data-test-aiReporting-chartCustomize-tab="${tab}"]`)
          .hasText(t(`reportModule.chartSettings.tabs.${tab}`));
      });

      await click('[data-test-aiReporting-chartCustomize-close]');

      assert.dom('[data-test-aiReporting-chartCustomize]').doesNotExist();
    });

    test('renaming and recolouring a series redraws the chart', async function (assert) {
      await renderChart();
      await click('[data-test-aiReporting-preview-chart-customizeBtn]');

      await fillIn('[data-test-aiReporting-chartCustomize-itemName]', 'Issues');
      await click('[data-test-aiReporting-chartCustomize-swatch="#EF8C8C"]');

      const [series] = drawnOption().series;

      assert.strictEqual(series.name, 'Issues');
      assert.strictEqual(series.itemStyle.color, '#EF8C8C');

      assert
        .dom('[data-test-aiReporting-chartCustomize-swatch="#EF8C8C"]')
        .hasAttribute('aria-pressed', 'true');
    });

    test('display options change the drawn chart', async function (assert) {
      await renderChart();
      await click('[data-test-aiReporting-preview-chart-customizeBtn]');
      await click(
        '[data-test-aiReporting-chartCustomize-tab="display"] button'
      );

      await click(
        '[data-test-aiReporting-chartCustomize-values] [data-test-aiReporting-chartCustomize-segment="off"]'
      );

      assert.false(drawnOption().series[0].label.show, 'value labels off');

      await click(
        '[data-test-aiReporting-chartCustomize-trendLine] [data-test-toggle-input]'
      );

      assert.strictEqual(
        drawnOption().series.length,
        2,
        'a trend line is added'
      );

      await click(
        '[data-test-aiReporting-chartCustomize-goal] [data-test-toggle-input]'
      );
      await fillIn('[data-test-aiReporting-chartCustomize-goalValue]', '3');

      assert.strictEqual(drawnOption().series[0].markLine.data[0].yAxis, 3);
    });

    test('axis titles start from the columns and can be changed', async function (assert) {
      await renderChart();
      await click('[data-test-aiReporting-preview-chart-customizeBtn]');
      await click('[data-test-aiReporting-chartCustomize-tab="axes"] button');

      assert
        .dom('[data-test-aiReporting-chartCustomize-xAxisTitle]')
        .hasValue('Severity');

      await fillIn(
        '[data-test-aiReporting-chartCustomize-yAxisTitle]',
        'Count'
      );
      await fillIn('[data-test-aiReporting-chartCustomize-yAxisMax]', '20');

      const { yAxis } = drawnOption();

      assert.strictEqual(yAxis[0].name, 'Count');
      assert.strictEqual(yAxis[0].max, 20);
    });

    test('a pie lists its slices and has no axes tab', async function (assert) {
      this.set('kind', 'pie');

      await renderChart();
      await click('[data-test-aiReporting-preview-chart-customizeBtn]');

      assert.dom('[data-test-aiReporting-chartCustomize-item="High"]').exists();
      assert.dom('[data-test-aiReporting-chartCustomize-item="Low"]').exists();
      assert
        .dom('[data-test-aiReporting-chartCustomize-tab="axes"]')
        .doesNotExist();

      await click(
        '[data-test-aiReporting-chartCustomize-tab="display"] button'
      );

      assert.dom('[data-test-aiReporting-chartCustomize-pieTotal]').exists();
      assert
        .dom('[data-test-aiReporting-chartCustomize-trendLine]')
        .doesNotExist();
    });

    test('number tiles can be renamed and formatted', async function (assert) {
      this.setProperties({
        chart: { type: 'number', x: null, y: ['findings'], series: null },
        rows: [{ findings: 42 }],
      });

      await renderChart();
      await click('[data-test-aiReporting-preview-chart-customizeBtn]');

      await fillIn('[data-test-aiReporting-chartCustomize-itemName]', 'Open');
      await click(
        '[data-test-aiReporting-chartCustomize-tab="display"] button'
      );
      await fillIn('[data-test-aiReporting-chartCustomize-prefix]', '#');

      assert
        .dom('[data-test-aiReporting-preview-chart-tile="findings"]')
        .containsText('Open')
        .containsText('#42');

      assert
        .dom('[data-test-aiReporting-chartCustomize-swatch]')
        .doesNotExist();
    });

    test('Reset goes back to the chart the report picked', async function (assert) {
      await renderChart();
      await click('[data-test-aiReporting-preview-chart-customizeBtn]');
      await fillIn('[data-test-aiReporting-chartCustomize-itemName]', 'Issues');

      await click('[data-test-aiReporting-chartCustomize-reset]');

      assert.strictEqual(this.resets, 1);
      assert.strictEqual(drawnOption().series[0].name, 'Findings');
    });
  }
);
