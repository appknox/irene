/**
 * ECharts options for the charts with axes (bar, horizontal bar, line, area,
 * stacked and grouped bar), with the viewer's settings applied: series names,
 * colours and display types, a second y-axis, value labels, legend, number
 * format, 100% stacking, line style, goal and trend lines, and both axes.
 *
 * Plain functions with no Ember imports.
 */
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';

import type { ECOption } from 'irene/components/ak-chart';

import {
  formatChartNumber,
  seriesSettings,
  trendValues,
  type ReportChartSettings,
  type SeriesDisplay,
} from 'irene/utils/ai-reporting/report-chart-settings';

import {
  AXIS_TEXT_COLOR,
  GRID_LINE_COLOR,
  REPORT_CHART_PALETTE,
  type ChartSeries,
  type ChartTable,
} from 'irene/utils/ai-reporting/report-chart-table';

export interface CartesianStyle {
  type: 'bar' | 'line';
  horizontal?: boolean;
  stacked?: boolean;
  area?: boolean;
}

type CartesianSeries = BarSeriesOption | LineSeriesOption;

/** Everything one series needs from the chart it is drawn in. */
interface SeriesContext {
  style: CartesianStyle;
  settings: ReportChartSettings;
  labelled: boolean;
  rightAxis: boolean;
  format: (value: unknown) => string;
  points: number;
}

const ROTATE_LABELS_AFTER = 6;
const MAX_LABELLED_POINTS = 24;
const MAX_LABELLED_SERIES = 3;
const MAX_DOTS = 40;
const GOAL_LINE_COLOR = '#7C7F88';
const LINE_WIDTHS = { small: 1.5, medium: 2.5, large: 4 };

/** The option for a chart with axes, as the viewer customised it. */
export function cartesianOption(
  table: ChartTable,
  style: CartesianStyle,
  settings: ReportChartSettings
): ECOption {
  const percent = !!style.stacked && settings.stackPercent;
  const drawn = percent ? asShares(table) : table;
  const ctx = seriesContext(drawn, style, settings, percent);

  const series = drawn.series.map((item, index) =>
    cartesianSeries(item, index, drawn, ctx)
  );

  const legend = showLegend(settings, drawn.series.length);
  const valueAxes = valueAxisOptions(drawn, ctx, percent);

  return {
    color: REPORT_CHART_PALETTE,
    textStyle: { fontFamily: 'inherit' },
    grid: {
      left: 48,
      right: ctx.rightAxis ? 56 : 32,
      top: legend ? 48 : 32,
      bottom: style.horizontal ? 40 : 48,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: style.type === 'bar' ? 'shadow' : 'line' },
      valueFormatter: (value) => ctx.format(value),
    },
    legend: { show: legend, type: 'scroll', top: 0, icon: 'circle' },
    xAxis: style.horizontal ? valueAxes : categoryAxisOption(drawn, ctx),
    yAxis: style.horizontal ? categoryAxisOption(drawn, ctx) : valueAxes,
    series: [...withGoal(series, ctx), ...trendSeries(drawn, ctx)],
  };
}

function seriesContext(
  table: ChartTable,
  style: CartesianStyle,
  settings: ReportChartSettings,
  percent: boolean
): SeriesContext {
  const canSplitAxes =
    !style.horizontal && !style.stacked && table.series.length > 1;

  return {
    style,
    settings,
    labelled: valueLabels(table, style, settings),
    rightAxis:
      canSplitAxes &&
      table.series.some((item) => seriesSettings(settings, item.key).rightAxis),
    format: percent
      ? (value) =>
          `${formatChartNumber(value, { ...settings.number, prefix: '', suffix: '', multiplyBy: 1 })}%`
      : (value) => formatChartNumber(value, settings.number),
    points: table.categories.length,
  };
}

/** Each category's values as shares of its total, for a 100% stacked bar. */
function asShares(table: ChartTable): ChartTable {
  const sums = table.categories.map((_, i) =>
    table.series.reduce((sum, item) => sum + (item.data[i] ?? 0), 0)
  );

  return {
    ...table,
    series: table.series.map((item) => ({
      ...item,
      data: item.data.map((value, i) => share(value, sums[i] ?? 0)),
    })),
  };
}

function cartesianSeries(
  item: ChartSeries,
  index: number,
  table: ChartTable,
  ctx: SeriesContext
): CartesianSeries {
  const own = seriesSettings(ctx.settings, item.key);
  const color = own.color || undefined;

  const common = {
    name: own.name || item.name,
    data: seriesData(item, table),
    label: labelOption(ctx),
    ...(color ? { itemStyle: { color } } : {}),
    ...(ctx.rightAxis && own.rightAxis ? { yAxisIndex: 1 } : {}),
  };

  const display = seriesDisplay(own.display, ctx.style);

  if (display === 'bar') {
    return {
      type: 'bar',
      ...common,
      barMaxWidth: 120,
      barCategoryGap: '35%',
      ...(ctx.style.stacked ? { stack: 'total' } : {}),
    };
  }

  return {
    type: 'line',
    ...common,
    ...lineOptions(ctx, color),
    ...(display === 'area' ? { areaStyle: { opacity: 0.25 } } : {}),
    z: 3 + index,
  };
}

/** A series' values, coloured per category when the categories carry their own colours. */
function seriesData(item: ChartSeries, table: ChartTable) {
  const colors = table.categoryColors;

  if (!colors || !colors.some(Boolean)) {
    return item.data;
  }

  return item.data.map((value, i) =>
    colors[i] ? { value, itemStyle: { color: colors[i] } } : value
  );
}

/** What a series is drawn as: the viewer's pick, except where the chart allows only bars. */
function seriesDisplay(
  display: SeriesDisplay | undefined,
  style: CartesianStyle
): 'bar' | 'line' | 'area' {
  const fixed = style.horizontal || style.stacked;

  if (!fixed && display && display !== 'default') {
    return display;
  }

  if (style.type === 'bar') {
    return 'bar';
  }

  return style.area ? 'area' : 'line';
}

function lineOptions(ctx: SeriesContext, color: string | undefined) {
  const line = ctx.settings.line;

  return {
    smooth: line.shape === 'curved',
    ...(line.shape === 'step' ? { step: 'middle' as const } : {}),
    symbolSize: 6,
    showSymbol:
      line.dots === 'auto' ? ctx.points <= MAX_DOTS : line.dots === 'on',
    lineStyle: {
      type: line.style,
      width: LINE_WIDTHS[line.width],
      ...(color ? { color } : {}),
    },
  };
}

function labelOption(ctx: SeriesContext) {
  const position = labelPosition(ctx.style);

  return {
    show: ctx.labelled,
    position,
    fontWeight: 'bold' as const,
    // an empty segment of a stack has nothing to label
    formatter: ({ value }: { value: unknown }) =>
      ctx.style.stacked && !value ? '' : ctx.format(value),
  };
}

/** Value labels where the viewer asked for them; on "auto", only where they stay readable. */
function valueLabels(
  table: ChartTable,
  style: CartesianStyle,
  settings: ReportChartSettings
): boolean {
  if (settings.values !== 'auto') {
    return settings.values === 'all';
  }

  return (
    !style.stacked &&
    table.series.length <= MAX_LABELLED_SERIES &&
    table.categories.length <= MAX_LABELLED_POINTS
  );
}

function showLegend(settings: ReportChartSettings, seriesCount: number) {
  return settings.legend === 'auto'
    ? seriesCount > 1
    : settings.legend === 'on';
}

/** The goal line, drawn across the plot on the first series. */
function withGoal(
  series: CartesianSeries[],
  ctx: SeriesContext
): CartesianSeries[] {
  const goal = ctx.settings.goal;

  if (!goal.show || goal.value === null || !series.length) {
    return series;
  }

  const [first, ...rest] = series;

  const markLine = {
    silent: true,
    symbol: 'none',
    lineStyle: { type: 'dashed' as const, color: GOAL_LINE_COLOR, width: 1.5 },
    label: {
      formatter: goal.label || ctx.format(goal.value),
      position: 'insideEndTop' as const,
      color: GOAL_LINE_COLOR,
    },
    data: [
      ctx.style.horizontal ? { xAxis: goal.value } : { yAxis: goal.value },
    ],
  };

  return [{ ...first, markLine } as CartesianSeries, ...rest];
}

/** A dashed straight line of best fit for each series, in the series' colour. */
function trendSeries(
  table: ChartTable,
  ctx: SeriesContext
): LineSeriesOption[] {
  const allowed = !ctx.style.horizontal && !ctx.style.stacked && ctx.points > 1;

  if (!ctx.settings.trendLine || !allowed) {
    return [];
  }

  return table.series.map((item, index) => {
    const own = seriesSettings(ctx.settings, item.key);
    const color =
      own.color || REPORT_CHART_PALETTE[index % REPORT_CHART_PALETTE.length];

    return {
      type: 'line',
      name: `${own.name || item.name} ${ctx.settings.text.trend}`.trim(),
      data: trendValues(item.data),
      showSymbol: false,
      silent: true,
      lineStyle: { type: 'dashed', width: 1.5, color },
      itemStyle: { color },
      ...(ctx.rightAxis && own.rightAxis ? { yAxisIndex: 1 } : {}),
    };
  });
}

function categoryAxisOption(table: ChartTable, ctx: SeriesContext) {
  const axis = ctx.settings.xAxis;
  const horizontal = !!ctx.style.horizontal;
  const rotate = !horizontal && table.categories.length > ROTATE_LABELS_AFTER;
  // a horizontal bar's names already read as row headings
  const defaultTitle = horizontal ? '' : table.xName;

  return {
    type: 'category' as const,
    show: axis.show,
    data: table.categories,
    name: axis.title ?? defaultTitle,
    // on a horizontal bar the title sits above the row names, which fill the left side
    nameLocation: horizontal ? ('start' as const) : ('middle' as const),
    nameGap: categoryNameGap(horizontal, rotate),
    nameTextStyle: { color: AXIS_TEXT_COLOR },
    // the first row reads top-down on a horizontal bar, as in the table
    inverse: horizontal,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: GRID_LINE_COLOR } },
    axisLabel: {
      show: axis.labels,
      interval: 0,
      rotate: rotate ? 30 : 0,
      width: horizontal ? 200 : 140,
      overflow: 'truncate' as const,
      color: AXIS_TEXT_COLOR,
    },
  };
}

/** The value axis, and a second one on the right when any series asks for it. */
function valueAxisOptions(
  table: ChartTable,
  ctx: SeriesContext,
  percent: boolean
) {
  const axis = ctx.settings.yAxis;
  const horizontal = !!ctx.style.horizontal;

  const main = {
    type: axis.log ? ('log' as const) : ('value' as const),
    show: axis.show,
    name: axis.title ?? table.yName,
    nameLocation: 'middle' as const,
    nameGap: horizontal ? 28 : 52,
    nameTextStyle: { color: AXIS_TEXT_COLOR },
    ...(axis.log ? {} : { minInterval: 1 }),
    ...(axis.min !== null ? { min: axis.min } : {}),
    ...axisMax(axis.max, percent),
    axisLabel: {
      show: axis.labels,
      color: AXIS_TEXT_COLOR,
      formatter: (value: number) => ctx.format(value),
    },
    splitLine: { show: axis.gridLines, lineStyle: { color: GRID_LINE_COLOR } },
  };

  if (!ctx.rightAxis) {
    return main;
  }

  return [
    main,
    {
      ...main,
      name: '',
      position: 'right' as const,
      splitLine: { show: false },
    },
  ];
}

/** A value as its share of a category's total, in percent with one decimal. */
function share(value: number, total: number): number {
  return total ? Math.round((value / total) * 1000) / 10 : 0;
}

function labelPosition(style: CartesianStyle): 'right' | 'inside' | 'top' {
  if (style.horizontal) {
    return 'right';
  }

  return style.stacked ? 'inside' : 'top';
}

/** Room for the category axis title: just above the rows on a horizontal bar, below rotated labels. */
function categoryNameGap(horizontal: boolean, rotate: boolean): number {
  if (horizontal) {
    return 12;
  }

  return rotate ? 64 : 32;
}

/** The viewer's maximum, else 100 for a 100% stacked bar, else ECharts' own choice. */
function axisMax(max: number | null, percent: boolean) {
  if (max !== null) {
    return { max };
  }

  return percent ? { max: 100 } : {};
}
