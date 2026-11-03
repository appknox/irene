import { module, test } from 'qunit';

import {
  reportChartAxisTitles,
  reportChartControls,
  reportChartItems,
  reportChartKinds,
  reportChartOption,
  reportChartTiles,
} from 'irene/utils/ai-reporting/report-chart';

import {
  defaultChartSettings,
  withSeries,
  withSetting,
} from 'irene/utils/ai-reporting/report-chart-settings';

const COLUMNS = [
  { field: 'project__package_name', label: 'Namespace' },
  { field: 'project__platform', label: 'Platform' },
  { field: 'risk', label: 'Severity' },
  { field: 'created_on__month', label: 'Found On (Month)' },
  { field: 'findings', label: 'Findings' },
  { field: 'apps', label: 'Apps' },
];

const SEVERITY_ROWS = [
  { risk: 'High', findings: 12 },
  { risk: 'Low', findings: '3' },
];

const PIVOT_ROWS = [
  { created_on__month: 'Jun 2026', risk: 'High', findings: 2 },
  { created_on__month: 'Jun 2026', risk: 'Low', findings: 1 },
  { created_on__month: 'Jul 2026', risk: 'High', findings: 4 },
];

function chart(type, overrides = {}) {
  return { type, x: null, y: ['findings'], series: null, ...overrides };
}

const BAR = chart('bar', { x: 'risk' });
const STACKED = chart('stacked_bar', {
  x: 'created_on__month',
  series: 'risk',
});

function seriesSummary(option) {
  return option.series.map((s) => [s.type, s.name, s.data, s.stack]);
}

module('Unit | Utility | ai-reporting/report-chart', function () {
  module('reportChartKinds', function () {
    test('offers the kinds that fit the report shape', function (assert) {
      assert.deepEqual(reportChartKinds(chart('number')), ['number']);

      assert.deepEqual(
        reportChartKinds(chart('number', { y: ['findings', 'apps'] })),
        ['number', 'bar', 'row', 'pie'],
        'several totals in one row also compare as bars'
      );

      assert.deepEqual(reportChartKinds(BAR), [
        'bar',
        'row',
        'line',
        'area',
        'pie',
      ]);

      assert.deepEqual(
        reportChartKinds(chart('line', { x: 'risk', y: ['findings', 'apps'] })),
        ['bar', 'row', 'line', 'area'],
        'no pie for several totals'
      );

      assert.deepEqual(reportChartKinds(STACKED), [
        'stacked_bar',
        'grouped_bar',
        'line',
      ]);
    });
  });

  module('reportChartTiles', function () {
    test('gives one tile per total, labelled from the columns', function (assert) {
      const tiles = reportChartTiles(
        chart('number', { y: ['findings', 'apps'] }),
        [{ findings: 1234, apps: 8 }],
        COLUMNS
      );

      assert.deepEqual(tiles, [
        {
          field: 'findings',
          label: 'Findings',
          value: (1234).toLocaleString(),
        },
        { field: 'apps', label: 'Apps', value: '8' },
      ]);
    });

    test('shows a dash when the total is missing or null', function (assert) {
      const tiles = reportChartTiles(
        chart('number'),
        [{ findings: null }],
        COLUMNS
      );

      assert.strictEqual(tiles[0].value, '—');
      assert.strictEqual(
        reportChartTiles(chart('number'), [], COLUMNS)[0].value,
        '—'
      );
    });

    test('keeps non-number totals such as a latest date as they are', function (assert) {
      const tiles = reportChartTiles(
        chart('number', { y: ['latest'] }),
        [{ latest: '2026-07-01' }],
        COLUMNS
      );

      assert.strictEqual(tiles[0].value, '2026-07-01');
      assert.strictEqual(tiles[0].label, 'latest', 'falls back to the field');
    });
  });

  module('reportChartOption', function () {
    test('number charts and empty rows get no option', function (assert) {
      assert.strictEqual(
        reportChartOption(chart('number'), [{ findings: 1 }], COLUMNS),
        null
      );

      assert.strictEqual(reportChartOption(BAR, [], COLUMNS), null);
    });

    test('bar keeps row order, names both axes and labels each bar', function (assert) {
      const option = reportChartOption(BAR, SEVERITY_ROWS, COLUMNS);

      assert.deepEqual(option.xAxis.data, ['High', 'Low']);
      assert.strictEqual(option.xAxis.name, 'Severity');
      assert.strictEqual(option.yAxis.name, 'Findings');
      assert.deepEqual(seriesSummary(option), [
        ['bar', 'Findings', [12, 3], undefined],
      ]);
      assert.true(option.series[0].label.show);
      assert.false(option.legend.show, 'one series needs no legend');
    });

    test('an app axis also names its platform so same-name apps stay apart', function (assert) {
      const option = reportChartOption(
        chart('bar', { x: 'project__package_name' }),
        [
          {
            project__package_name: 'com.shop',
            project__platform: 'Android',
            findings: 4,
          },
          {
            project__package_name: 'com.shop',
            project__platform: 'iOS',
            findings: 2,
          },
        ],
        COLUMNS
      );

      assert.deepEqual(option.xAxis.data, [
        'com.shop · Android',
        'com.shop · iOS',
      ]);
    });

    test('other columns of the record are left out when the name alone is unique', function (assert) {
      const option = reportChartOption(
        chart('bar', { x: 'vulnerability__name', y: ['apps'] }),
        [
          {
            vulnerability__name: 'Weak Crypto',
            vulnerability__compliant: '<p>Use AES-GCM</p>',
            apps: 5,
          },
          {
            vulnerability__name: 'Debuggable App',
            vulnerability__compliant: '<p>Turn off debuggable</p>',
            apps: 3,
          },
        ],
        [
          { field: 'vulnerability__name', label: 'Vulnerability' },
          { field: 'vulnerability__compliant', label: 'Compliant Solution' },
          { field: 'apps', label: 'Apps' },
        ]
      );

      assert.deepEqual(option.xAxis.data, ['Weak Crypto', 'Debuggable App']);
    });

    test('list values read as text, an empty list as a dash', function (assert) {
      const option = reportChartOption(
        chart('bar', { x: 'owasp' }),
        [
          { owasp: ['M6_2024', 'M9_2024'], findings: 6 },
          { owasp: [], findings: 2 },
        ],
        [{ field: 'owasp', label: 'OWASP' }, ...COLUMNS]
      );

      assert.deepEqual(option.xAxis.data, ['M6_2024, M9_2024', '—']);
    });

    test('line plots one line per total and shows a legend for several', function (assert) {
      const option = reportChartOption(
        chart('line', { x: 'created_on__month', y: ['findings', 'apps'] }),
        [
          { created_on__month: 'Jun 2026', findings: 5, apps: 2 },
          { created_on__month: 'Jul 2026', findings: 7, apps: 3 },
        ],
        COLUMNS
      );

      assert.deepEqual(option.xAxis.data, ['Jun 2026', 'Jul 2026']);
      assert.deepEqual(seriesSummary(option), [
        ['line', 'Findings', [5, 7], undefined],
        ['line', 'Apps', [2, 3], undefined],
      ]);
      assert.true(option.legend.show);
      assert.strictEqual(option.yAxis.name, '', 'no single y label');
    });

    test('stacked bar pivots rows into one stack per series value', function (assert) {
      const option = reportChartOption(STACKED, PIVOT_ROWS, COLUMNS);

      assert.deepEqual(option.xAxis.data, ['Jun 2026', 'Jul 2026']);
      assert.deepEqual(
        seriesSummary(option),
        [
          ['bar', 'High', [2, 4], 'total'],
          ['bar', 'Low', [1, 0], 'total'],
        ],
        'a missing cell is drawn as zero'
      );
      assert.false(option.series[0].label.show, 'no labels inside stacks');
    });

    test('the viewer can switch a stacked bar to grouped bars or lines', function (assert) {
      const grouped = reportChartOption(
        STACKED,
        PIVOT_ROWS,
        COLUMNS,
        'grouped_bar'
      );

      const lines = reportChartOption(STACKED, PIVOT_ROWS, COLUMNS, 'line');

      assert.deepEqual(seriesSummary(grouped), [
        ['bar', 'High', [2, 4], undefined],
        ['bar', 'Low', [1, 0], undefined],
      ]);

      assert.deepEqual(
        lines.series.map((s) => s.type),
        ['line', 'line']
      );
    });

    test('horizontal bar puts the categories on the y axis, first row on top', function (assert) {
      const option = reportChartOption(BAR, SEVERITY_ROWS, COLUMNS, 'row');

      assert.strictEqual(option.yAxis.type, 'category');
      assert.deepEqual(option.yAxis.data, ['High', 'Low']);
      assert.true(option.yAxis.inverse);
      assert.strictEqual(option.xAxis.type, 'value');
      assert.strictEqual(option.series[0].label.position, 'right');
    });

    test('area is a filled line', function (assert) {
      const option = reportChartOption(BAR, SEVERITY_ROWS, COLUMNS, 'area');

      assert.strictEqual(option.series[0].type, 'line');
      assert.ok(option.series[0].areaStyle);
    });

    test('pie is a donut with the sum in the middle and shares in the legend', function (assert) {
      const option = reportChartOption(BAR, SEVERITY_ROWS, COLUMNS, 'pie');
      const [pie] = option.series;

      assert.strictEqual(pie.type, 'pie');
      assert.deepEqual(pie.data, [
        { name: 'High', value: 12 },
        { name: 'Low', value: 3 },
      ]);
      assert.strictEqual(option.title.text, '15');
      assert.strictEqual(option.title.subtext, 'Findings');
      assert.strictEqual(option.legend.formatter('High'), 'High  80.0%');
      assert.notOk(option.xAxis, 'a pie has no axes');
    });

    test('several totals in one row draw as one bar each', function (assert) {
      const severities = chart('number', {
        y: ['critical', 'high', 'medium', 'low'],
      });

      const rows = [{ critical: 2, high: 5, medium: 9, low: 1 }];

      const columns = [
        { field: 'critical', label: 'Critical' },
        { field: 'high', label: 'High' },
        { field: 'medium', label: 'Medium' },
        { field: 'low', label: 'Low' },
      ];

      const bar = reportChartOption(severities, rows, columns, 'bar');

      assert.deepEqual(bar.xAxis.data, ['Critical', 'High', 'Medium', 'Low']);
      assert.deepEqual(bar.series[0].data, [2, 5, 9, 1]);

      const pie = reportChartOption(severities, rows, columns, 'pie');

      assert.strictEqual(pie.title.text, '17');

      assert.strictEqual(
        reportChartOption(severities, rows, columns),
        null,
        'the default stays number tiles'
      );
    });

    test('a kind that does not fit falls back to the report default', function (assert) {
      const option = reportChartOption(STACKED, PIVOT_ROWS, COLUMNS, 'pie');

      assert.strictEqual(option.series[0].stack, 'total');
    });

    test('empty values and non-numbers do not break the chart', function (assert) {
      const option = reportChartOption(
        BAR,
        [
          { risk: null, findings: 'n/a' },
          { risk: '', findings: undefined },
        ],
        COLUMNS
      );

      assert.deepEqual(option.xAxis.data, ['—', '—']);
      assert.deepEqual(option.series[0].data, [0, 0]);
    });

    test('labels are rotated only when there are many categories', function (assert) {
      const rows = Array.from({ length: 7 }, (_, i) => ({
        risk: `R${i}`,
        findings: i,
      }));

      const many = reportChartOption(BAR, rows, COLUMNS);
      const few = reportChartOption(BAR, rows.slice(0, 3), COLUMNS);

      assert.strictEqual(many.xAxis.axisLabel.rotate, 30);
      assert.strictEqual(few.xAxis.axisLabel.rotate, 0);
    });
  });

  module('customisation', function () {
    const TWO_TOTALS = chart('bar', { x: 'risk', y: ['findings', 'apps'] });

    const TWO_TOTAL_ROWS = [
      { risk: 'High', findings: 12, apps: 3 },
      { risk: 'Low', findings: 4, apps: 1 },
    ];

    function customised(settings, kind, target = BAR, rows = SEVERITY_ROWS) {
      return reportChartOption(target, rows, COLUMNS, kind, settings);
    }

    test('default settings draw the chart as before', function (assert) {
      // formatter functions differ by identity, so compare everything else
      assert.strictEqual(
        JSON.stringify(customised(defaultChartSettings(), 'bar')),
        JSON.stringify(reportChartOption(BAR, SEVERITY_ROWS, COLUMNS))
      );
    });

    test('series can be renamed and recoloured', function (assert) {
      const settings = withSeries(defaultChartSettings(), 'findings', {
        name: 'Open issues',
        color: '#EF8C8C',
      });

      const [series] = customised(settings, 'bar').series;

      assert.strictEqual(series.name, 'Open issues');
      assert.deepEqual(series.itemStyle, { color: '#EF8C8C' });
    });

    test('one series can be drawn as a line on the right axis (combo)', function (assert) {
      const settings = withSeries(defaultChartSettings(), 'apps', {
        display: 'line',
        rightAxis: true,
      });

      const option = customised(settings, 'bar', TWO_TOTALS, TWO_TOTAL_ROWS);

      assert.deepEqual(
        option.series.map((s) => [s.type, s.yAxisIndex]),
        [
          ['bar', undefined],
          ['line', 1],
        ]
      );
      assert.strictEqual(option.yAxis.length, 2, 'a second value axis');
      assert.strictEqual(option.yAxis[1].position, 'right');
    });

    test('a horizontal or stacked bar keeps its bars whatever a series asks for', function (assert) {
      const settings = withSeries(defaultChartSettings(), 'High', {
        display: 'line',
        rightAxis: true,
      });

      const option = customised(settings, 'stacked_bar', STACKED, PIVOT_ROWS);

      assert.deepEqual(
        option.series.map((s) => s.type),
        ['bar', 'bar']
      );
      assert.notOk(Array.isArray(option.yAxis), 'no second axis');
    });

    test('value labels and the legend can be forced on or off', function (assert) {
      const off = withSetting(defaultChartSettings(), 'values', 'off');
      const on = withSetting(
        withSetting(defaultChartSettings(), 'values', 'all'),
        'legend',
        'on'
      );

      assert.false(customised(off, 'bar').series[0].label.show);

      const stacked = customised(on, 'stacked_bar', STACKED, PIVOT_ROWS);

      assert.true(stacked.series[0].label.show, 'even inside stacks');
      assert.strictEqual(stacked.series[0].label.position, 'inside');

      assert.true(customised(on, 'bar').legend.show);

      assert.false(
        customised(
          withSetting(defaultChartSettings(), 'legend', 'off'),
          'bar',
          TWO_TOTALS,
          TWO_TOTAL_ROWS
        ).legend.show
      );
    });

    test('categories can be sorted by their total', function (assert) {
      const rows = [
        { risk: 'Low', findings: 2 },
        { risk: 'High', findings: 9 },
        { risk: 'Medium', findings: 5 },
      ];

      const desc = withSetting(defaultChartSettings(), 'sort', 'desc');
      const asc = withSetting(defaultChartSettings(), 'sort', 'asc');

      assert.deepEqual(customised(desc, 'bar', BAR, rows).xAxis.data, [
        'High',
        'Medium',
        'Low',
      ]);
      assert.deepEqual(
        customised(asc, 'bar', BAR, rows).series[0].data,
        [2, 5, 9]
      );
    });

    test('a stacked bar can be stacked to 100%', function (assert) {
      const settings = withSetting(
        defaultChartSettings(),
        'stackPercent',
        true
      );
      const option = customised(settings, 'stacked_bar', STACKED, PIVOT_ROWS);

      assert.deepEqual(
        option.series.map((s) => s.data),
        [
          [66.7, 100],
          [33.3, 0],
        ]
      );
      assert.strictEqual(option.yAxis.max, 100);
      assert.strictEqual(option.yAxis.axisLabel.formatter(50), '50%');
      assert.strictEqual(
        option.series[0].label.formatter({ value: 0 }),
        '',
        'an empty segment has no label'
      );
    });

    test('a trend line follows each series in its colour', function (assert) {
      const settings = withSeries(
        withSetting(
          defaultChartSettings({ trend: 'trend' }),
          'trendLine',
          true
        ),
        'findings',
        { color: '#88BF4D' }
      );

      const rows = [
        { risk: 'A', findings: 2 },
        { risk: 'B', findings: 4 },
        { risk: 'C', findings: 6 },
      ];

      const option = customised(settings, 'bar', BAR, rows);
      const trend = option.series[1];

      assert.strictEqual(trend.name, 'Findings trend');
      assert.deepEqual(trend.data, [2, 4, 6]);
      assert.strictEqual(trend.lineStyle.type, 'dashed');
      assert.strictEqual(trend.lineStyle.color, '#88BF4D');
    });

    test('a goal line is drawn at the value with its label', function (assert) {
      const settings = withSetting(defaultChartSettings(), 'goal', {
        show: true,
        value: 10,
        label: 'Target',
      });

      const vertical = customised(settings, 'bar').series[0].markLine;
      const horizontal = customised(settings, 'row').series[0].markLine;

      assert.deepEqual(vertical.data, [{ yAxis: 10 }]);
      assert.strictEqual(vertical.label.formatter, 'Target');
      assert.deepEqual(horizontal.data, [{ xAxis: 10 }]);

      const hidden = withSetting(settings, 'goal', { show: false });

      assert.notOk(customised(hidden, 'bar').series[0].markLine);
    });

    test('line shape, style, size and dots', function (assert) {
      const settings = withSetting(defaultChartSettings(), 'line', {
        shape: 'step',
        style: 'dashed',
        width: 'large',
        dots: 'off',
      });

      const [series] = customised(settings, 'line').series;

      assert.strictEqual(series.step, 'middle');
      assert.false(series.smooth);
      assert.deepEqual(series.lineStyle, { type: 'dashed', width: 4 });
      assert.false(series.showSymbol);

      const curved = withSetting(settings, 'line', { shape: 'curved' });

      assert.true(customised(curved, 'line').series[0].smooth);
    });

    test('axes can be hidden, renamed, bounded and drawn on a log scale', function (assert) {
      let settings = withSetting(defaultChartSettings(), 'xAxis', {
        title: 'Risk level',
        labels: false,
      });

      settings = withSetting(settings, 'yAxis', {
        show: false,
        title: '',
        min: 0,
        max: 50,
        log: true,
        gridLines: false,
      });

      const option = customised(settings, 'bar');

      assert.strictEqual(option.xAxis.name, 'Risk level');
      assert.strictEqual(
        customised(settings, 'row').yAxis.nameLocation,
        'start',
        'a horizontal bar shows the title above its rows'
      );
      assert.false(option.xAxis.axisLabel.show);
      assert.false(option.yAxis.show);
      assert.strictEqual(option.yAxis.name, '', 'an empty title hides it');
      assert.strictEqual(option.yAxis.type, 'log');
      assert.deepEqual([option.yAxis.min, option.yAxis.max], [0, 50]);
      assert.false(option.yAxis.splitLine.show);
    });

    test('the number format reaches labels, tooltips, axes and tiles', function (assert) {
      const settings = withSetting(defaultChartSettings(), 'number', {
        prefix: '$',
        decimals: 1,
      });

      const option = customised(settings, 'bar');
      const one = (1).toLocaleString(undefined, { minimumFractionDigits: 1 });

      assert.strictEqual(
        option.series[0].label.formatter({ value: 1 }),
        `$${one}`
      );
      assert.strictEqual(option.tooltip.valueFormatter(1), `$${one}`);
      assert.strictEqual(option.yAxis.axisLabel.formatter(1), `$${one}`);

      const tiles = reportChartTiles(
        chart('number'),
        [{ findings: 1 }],
        COLUMNS,
        withSeries(settings, 'findings', { name: 'Open' })
      );

      assert.deepEqual(tiles[0], {
        field: 'findings',
        label: 'Open',
        value: `$${one}`,
      });
    });

    test('pie slices can be renamed, recoloured, labelled and grouped as Other', function (assert) {
      const rows = [
        { risk: 'High', findings: 90 },
        { risk: 'Low', findings: 6 },
        { risk: 'Medium', findings: 4 },
      ];

      let settings = withSeries(
        defaultChartSettings({ other: 'Rest' }),
        'High',
        {
          name: 'High risk',
          color: '#EF8C8C',
        }
      );

      settings = withSetting(settings, 'pie', {
        total: false,
        labels: true,
        percentages: 'chart',
        minSlicePercent: 10,
      });

      const option = customised(settings, 'pie', BAR, rows);
      const [pie] = option.series;

      assert.deepEqual(
        pie.data.map((d) => [d.name, d.value, d.itemStyle?.color]),
        [
          ['High risk', 90, '#EF8C8C'],
          ['Rest', 10, '#B8BBC3'],
        ]
      );
      assert.false(option.title.show);
      assert.true(pie.label.show);
      assert.strictEqual(
        pie.label.formatter({ name: 'High risk', percent: 90 }),
        'High risk: 90.0%'
      );
      assert.strictEqual(option.legend.formatter('High risk'), 'High risk');
    });

    test('a pie without a legend is centred', function (assert) {
      const settings = withSetting(defaultChartSettings(), 'legend', 'off');
      const option = customised(settings, 'pie');

      assert.false(option.legend.show);
      assert.deepEqual(option.series[0].center, ['50%', '50%']);
      assert.strictEqual(option.title.left, '50%');
    });
  });

  module('settings panel helpers', function () {
    test('items: series for most charts, slices for pies, numbers for tiles', function (assert) {
      assert.deepEqual(reportChartItems(BAR, SEVERITY_ROWS, COLUMNS, 'bar'), [
        { key: 'findings', label: 'Findings' },
      ]);

      assert.deepEqual(reportChartItems(BAR, SEVERITY_ROWS, COLUMNS, 'pie'), [
        { key: 'High', label: 'High' },
        { key: 'Low', label: 'Low' },
      ]);

      assert.deepEqual(
        reportChartItems(STACKED, PIVOT_ROWS, COLUMNS, 'stacked_bar').map(
          (item) => item.key
        ),
        ['High', 'Low']
      );

      assert.deepEqual(
        reportChartItems(chart('number'), [{ findings: 1 }], COLUMNS, 'number'),
        [{ key: 'findings', label: 'Findings' }]
      );
    });

    test('controls follow the chart kind', function (assert) {
      const settings = defaultChartSettings();
      const bar = reportChartControls(BAR, 'bar', settings);
      const row = reportChartControls(BAR, 'row', settings);
      const pie = reportChartControls(BAR, 'pie', settings);
      const stacked = reportChartControls(STACKED, 'stacked_bar', settings);
      const number = reportChartControls(chart('number'), 'number', settings);

      assert.true(bar.seriesDisplay);
      assert.true(bar.trend);
      assert.true(bar.goal);
      assert.true(bar.axes);
      assert.false(bar.rightAxis, 'one total has nothing to split across axes');
      assert.false(row.trend);
      assert.false(row.seriesDisplay);
      assert.true(pie.pie);
      assert.true(pie.legend);
      assert.true(pie.sort);
      assert.false(pie.axes);
      assert.strictEqual(pie.items, 'categories');
      assert.true(stacked.stackPercent);
      assert.false(stacked.trend);
      assert.strictEqual(number.items, 'tiles');
      assert.false(number.colors);
      assert.false(number.axes);
      assert.false(number.legend);

      const percent = withSetting(settings, 'stackPercent', true);

      assert.false(
        reportChartControls(STACKED, 'stacked_bar', percent).goal,
        'no goal on a 100% stack'
      );

      const combo = withSeries(settings, 'findings', { display: 'line' });

      assert.true(reportChartControls(BAR, 'bar', combo).line);
    });

    test('default axis titles are the column labels', function (assert) {
      assert.deepEqual(reportChartAxisTitles(BAR, COLUMNS, 'bar'), {
        x: 'Severity',
        y: 'Findings',
      });
      assert.deepEqual(reportChartAxisTitles(BAR, COLUMNS, 'row'), {
        x: '',
        y: 'Findings',
      });
      assert.deepEqual(reportChartAxisTitles(BAR, COLUMNS, 'pie'), {
        x: '',
        y: '',
      });
    });
  });
});
