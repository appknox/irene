/**
 * Turns an AI report's chart description and rows into what the page draws:
 * number tiles, or an ECharts option for a bar, horizontal bar, line, area,
 * pie, stacked or grouped bar chart, with the viewer's customisations.
 *
 * Plain functions with no Ember imports, so the same mapping works for any
 * frontend. The backend picks the default chart from the report's shape; the
 * viewer can switch to any other kind that fits the same rows, and customise
 * it (see report-chart-settings).
 */
import type { ECOption } from 'irene/components/ak-chart';

import type {
  ReportChart,
  ReportPreviewColumn,
  ReportPreviewData,
} from 'irene/models/ai-reporting/report-request';

import {
  cartesianOption,
  type CartesianStyle,
} from 'irene/utils/ai-reporting/report-chart-cartesian';

import { pieOption } from 'irene/utils/ai-reporting/report-chart-pie';

import {
  defaultChartSettings,
  formatChartNumber,
  seriesSettings,
  type ReportChartSettings,
} from 'irene/utils/ai-reporting/report-chart-settings';

import {
  buildChartTable,
  columnLabel,
  sortChartTable,
  withCategorySettings,
  type ChartTable,
} from 'irene/utils/ai-reporting/report-chart-table';

export { REPORT_CHART_PALETTE } from 'irene/utils/ai-reporting/report-chart-table';

export type ReportChartKind =
  | 'number'
  | 'bar'
  | 'row'
  | 'line'
  | 'area'
  | 'pie'
  | 'stacked_bar'
  | 'grouped_bar';

export interface ReportChartTile {
  field: string;
  label: string;
  value: string;
}

/** A series, pie slice or number tile the viewer can rename or recolour. */
export interface ReportChartItem {
  key: string;
  label: string;
}

export type ReportChartItemLevel = 'series' | 'categories' | 'tiles';

/** Which customisations make sense for a chart kind. */
export interface ReportChartControls {
  items: ReportChartItemLevel;
  colors: boolean;
  seriesDisplay: boolean;
  rightAxis: boolean;
  values: boolean;
  legend: boolean;
  sort: boolean;
  goal: boolean;
  trend: boolean;
  stackPercent: boolean;
  line: boolean;
  axes: boolean;
  pie: boolean;
}

const ONE_GROUP_KINDS: ReportChartKind[] = ['bar', 'row', 'line', 'area'];
const SEVERAL_TOTALS_KINDS: ReportChartKind[] = ['number', 'bar', 'row', 'pie'];
const TWO_GROUP_KINDS: ReportChartKind[] = [
  'stacked_bar',
  'grouped_bar',
  'line',
];

const CARTESIAN_KINDS = new Set<ReportChartKind>([
  'bar',
  'row',
  'line',
  'area',
  'stacked_bar',
  'grouped_bar',
]);

const CARTESIAN_STYLES: Partial<Record<ReportChartKind, CartesianStyle>> = {
  bar: { type: 'bar' },
  grouped_bar: { type: 'bar' },
  row: { type: 'bar', horizontal: true },
  stacked_bar: { type: 'bar', stacked: true },
  line: { type: 'line' },
  area: { type: 'line', area: true },
};

/** The chart kinds a report's rows can be drawn as; the first fitting default is the backend's. */
export function reportChartKinds(chart: ReportChart): ReportChartKind[] {
  if (chart.type === 'number') {
    // several totals in one row (critical, high, medium, low) also compare as bars
    return chart.y.length > 1 ? SEVERAL_TOTALS_KINDS : ['number'];
  }

  if (chart.series) {
    return TWO_GROUP_KINDS;
  }

  return chart.y.length === 1 ? [...ONE_GROUP_KINDS, 'pie'] : ONE_GROUP_KINDS;
}

/** One tile per total, read from the single row a number chart has, named and formatted as the viewer chose. */
export function reportChartTiles(
  chart: ReportChart,
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[],
  settings: ReportChartSettings = defaultChartSettings()
): ReportChartTile[] {
  const row = rows[0] ?? {};

  return chart.y.map((field) => ({
    field,
    label: seriesSettings(settings, field).name || columnLabel(field, columns),
    value: formatChartNumber(row[field], settings.number),
  }));
}

/**
 * The ECharts option for the chosen kind (the backend's default when none is
 * chosen or it does not fit), customised by settings; null for number tiles or no rows.
 */
export function reportChartOption(
  chart: ReportChart,
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[],
  kind: ReportChartKind = chart.type,
  settings: ReportChartSettings = defaultChartSettings()
): ECOption | null {
  const drawn = fittingKind(chart, kind);

  if (drawn === 'number' || rows.length === 0) {
    return null;
  }

  let table = sortChartTable(
    buildChartTable(chart, rows, columns),
    settings.sort
  );

  if (coloredByCategory(chart, drawn)) {
    table = withCategorySettings(table, settings);
  }

  return optionFor(drawn, table, settings);
}

/** What the viewer can rename and recolour for this kind: its series, its pie slices or its tiles. */
export function reportChartItems(
  chart: ReportChart,
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[],
  kind: ReportChartKind
): ReportChartItem[] {
  const drawn = fittingKind(chart, kind);

  if (drawn === 'number') {
    return chart.y.map((field) => ({
      key: field,
      label: columnLabel(field, columns),
    }));
  }

  const table = buildChartTable(chart, rows, columns);

  if (coloredByCategory(chart, drawn)) {
    return table.categoryKeys.map((key, i) => ({
      key,
      label: table.categories[i] ?? key,
    }));
  }

  return table.series.map((series) => ({
    key: series.key,
    label: series.name,
  }));
}

/** Which customisations apply to the kind being drawn (some also depend on current settings). */
export function reportChartControls(
  chart: ReportChart,
  kind: ReportChartKind,
  settings: ReportChartSettings
): ReportChartControls {
  const drawn = fittingKind(chart, kind);
  const cartesian = CARTESIAN_KINDS.has(drawn);
  const byCategory = coloredByCategory(chart, drawn);
  const mixable =
    cartesian && !byCategory && !['row', 'stacked_bar'].includes(drawn);
  const lineKind = drawn === 'line' || drawn === 'area';
  const percentStack = drawn === 'stacked_bar' && settings.stackPercent;

  return {
    items: itemLevel(drawn, byCategory),
    colors: drawn !== 'number',
    seriesDisplay: mixable,
    rightAxis: mixable && (chart.y.length > 1 || !!chart.series),
    values: cartesian,
    legend: cartesian || drawn === 'pie',
    sort: (cartesian && !lineKind) || drawn === 'pie',
    goal: cartesian && !percentStack,
    trend: cartesian && drawn !== 'row' && drawn !== 'stacked_bar',
    stackPercent: drawn === 'stacked_bar',
    line: lineKind || (mixable && hasLineSeries(settings)),
    axes: cartesian,
    pie: drawn === 'pie',
  };
}

/** The axis titles a chart shows before the viewer changes them. */
export function reportChartAxisTitles(
  chart: ReportChart,
  columns: ReportPreviewColumn[],
  kind: ReportChartKind
): { x: string; y: string } {
  const drawn = fittingKind(chart, kind);

  if (!chart.x || !CARTESIAN_KINDS.has(drawn)) {
    return { x: '', y: '' };
  }

  const y =
    chart.y.length === 1 ? columnLabel(chart.y[0] as string, columns) : '';

  // a horizontal bar's names already read as row headings
  return { x: drawn === 'row' ? '' : columnLabel(chart.x, columns), y };
}

function itemLevel(
  kind: ReportChartKind,
  byCategory: boolean
): ReportChartItemLevel {
  if (kind === 'number') {
    return 'tiles';
  }

  return byCategory ? 'categories' : 'series';
}

function fittingKind(
  chart: ReportChart,
  kind: ReportChartKind
): ReportChartKind {
  return reportChartKinds(chart).includes(kind) ? kind : chart.type;
}

/** Pies and one-row totals are coloured and named per category, not per series. */
function coloredByCategory(chart: ReportChart, kind: ReportChartKind): boolean {
  return kind === 'pie' || !chart.x;
}

function hasLineSeries(settings: ReportChartSettings): boolean {
  return Object.values(settings.series).some(
    (item) => item.display === 'line' || item.display === 'area'
  );
}

function optionFor(
  kind: ReportChartKind,
  table: ChartTable,
  settings: ReportChartSettings
): ECOption {
  if (kind === 'pie') {
    return pieOption(table, settings);
  }

  return cartesianOption(
    table,
    CARTESIAN_STYLES[kind] ?? { type: 'bar' },
    settings
  );
}
