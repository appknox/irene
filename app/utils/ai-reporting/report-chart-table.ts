/**
 * Lays a report's rows out for a chart: the categories along one axis and one
 * value list per series, with the labels each would show.
 *
 * Plain functions with no Ember imports.
 */
import type {
  ReportChart,
  ReportPreviewColumn,
  ReportPreviewData,
} from 'irene/models/ai-reporting/report-request';

import {
  seriesSettings,
  type ReportChartSettings,
  type SortMode,
} from 'irene/utils/ai-reporting/report-chart-settings';

export interface ChartSeries {
  // what the viewer's settings for this series are keyed by: a total's field or a group value
  key: string;
  name: string;
  data: number[];
}

/** Rows laid out along one axis: a category list and one value list per series. */
export interface ChartTable {
  categories: string[];
  // what the viewer's settings for each category are keyed by
  categoryKeys: string[];
  // a colour per category, for charts coloured by category (pie, totals as bars)
  categoryColors?: (string | undefined)[];
  series: ChartSeries[];
  xName: string;
  yName: string;
}

export const REPORT_CHART_PALETTE = [
  '#509EE3',
  '#88BF4D',
  '#A989C5',
  '#EF8C8C',
  '#F9D45C',
  '#F2A86F',
  '#98D9D9',
  '#7172AD',
];

export const AXIS_TEXT_COLOR = '#696E7B';
export const GRID_LINE_COLOR = '#E6EBEF';

const EMPTY_LABEL = '—';
const LABEL_JOINER = ' · ';
const FIELD_SEP = '__';

/** The rows as a chart table: by the x column, or one category per total for a one-row report. */
export function buildChartTable(
  chart: ReportChart,
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[]
): ChartTable {
  if (!chart.x) {
    return totalsTable(chart, rows, columns);
  }

  const total = chart.y[0] as string;

  const layout = chart.series
    ? pivotRows(chart.x, chart.series, total, rows, columns)
    : seriesPerTotal(chart.x, chart.y, rows, columns);

  return {
    ...layout,
    categoryKeys: layout.categories,
    xName: columnLabel(chart.x, columns),
    yName: chart.y.length === 1 ? columnLabel(total, columns) : '',
  };
}

/** The table with its categories ordered by their total across series, largest or smallest first. */
export function sortChartTable(table: ChartTable, mode: SortMode): ChartTable {
  if (mode === 'default') {
    return table;
  }

  const sums = table.categories.map((_, i) =>
    table.series.reduce((sum, series) => sum + (series.data[i] ?? 0), 0)
  );

  const order = table.categories
    .map((_, i) => i)
    .sort((a, b) => {
      const difference = (sums[a] ?? 0) - (sums[b] ?? 0);

      return mode === 'desc' ? -difference : difference;
    });

  const pick = <T>(list: T[]) => order.map((i) => list[i] as T);

  return {
    ...table,
    categories: pick(table.categories),
    categoryKeys: pick(table.categoryKeys),
    categoryColors: table.categoryColors && pick(table.categoryColors),
    series: table.series.map((series) => ({
      ...series,
      data: pick(series.data),
    })),
  };
}

/** The table with the viewer's names and colours for its categories (pie slices, totals as bars). */
export function withCategorySettings(
  table: ChartTable,
  settings: ReportChartSettings
): ChartTable {
  const own = table.categoryKeys.map((key) => seriesSettings(settings, key));

  return {
    ...table,
    categories: table.categories.map((name, i) => own[i]?.name || name),
    categoryColors: own.map((item) => item.color || undefined),
  };
}

/** The totals of a one-row report as categories: one bar or slice per total. */
function totalsTable(
  chart: ReportChart,
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[]
): ChartTable {
  const row = rows[0] ?? {};

  return {
    categories: chart.y.map((field) => columnLabel(field, columns)),
    categoryKeys: [...chart.y],
    series: [
      { key: '', name: '', data: chart.y.map((field) => toNumber(row[field])) },
    ],
    xName: '',
    yName: '',
  };
}

/** One point per row, one series per total. */
function seriesPerTotal(
  x: string,
  totals: string[],
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[]
): Pick<ChartTable, 'categories' | 'series'> {
  const fields = labelFields(x, rows, columns, new Set(totals));

  return {
    categories: rows.map((row) => rowLabel(row, fields)),
    series: totals.map((field) => ({
      key: field,
      name: columnLabel(field, columns),
      data: rows.map((row) => toNumber(row[field])),
    })),
  };
}

/** x along the axis, one series per value of the series column; missing cells are zero. */
function pivotRows(
  x: string,
  seriesField: string,
  total: string,
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[]
): Pick<ChartTable, 'categories' | 'series'> {
  const xFields = labelFields(x, rows, columns, new Set([total, seriesField]));
  const groupFields = labelFields(seriesField, rows, columns, new Set([total]));

  const cells = new Map<string, number>();
  const categories: string[] = [];
  const groups: string[] = [];

  rows.forEach((row) => {
    const category = rowLabel(row, xFields);
    const group = rowLabel(row, groupFields);
    const key = cellKey(category, group);

    pushUnique(categories, category);
    pushUnique(groups, group);
    cells.set(key, (cells.get(key) ?? 0) + toNumber(row[total]));
  });

  return {
    categories,
    series: groups.map((group) => ({
      key: group,
      name: group,
      data: categories.map(
        (category) => cells.get(cellKey(category, group)) ?? 0
      ),
    })),
  };
}

/**
 * The columns that name a group: the axis column alone, plus as many of the
 * other columns pulled in from the same related record as it takes to tell the
 * rows apart (an app's platform when the same package is on Android and iOS).
 */
function labelFields(
  field: string,
  rows: ReportPreviewData[],
  columns: ReportPreviewColumn[],
  skip: Set<string>
): string[] {
  const candidates = siblingFields(field, columns, skip);
  const groups = distinctLabels(rows, candidates);

  for (let used = 1; used < candidates.length; used++) {
    const fields = candidates.slice(0, used);

    if (distinctLabels(rows, fields) === groups) {
      return fields;
    }
  }

  return candidates;
}

function distinctLabels(rows: ReportPreviewData[], fields: string[]): number {
  return new Set(rows.map((row) => rowLabel(row, fields))).size;
}

/** The axis column, then the other columns that share its related-record prefix. */
function siblingFields(
  field: string,
  columns: ReportPreviewColumn[],
  skip: Set<string>
): string[] {
  const cut = field.lastIndexOf(FIELD_SEP);

  if (cut <= 0) {
    return [field];
  }

  const prefix = field.slice(0, cut + FIELD_SEP.length);

  const siblings = columns
    .map((column) => column.field)
    .filter(
      (name) => name !== field && name.startsWith(prefix) && !skip.has(name)
    );

  return [field, ...siblings];
}

function rowLabel(row: ReportPreviewData, fields: string[]): string {
  return fields.map((field) => displayValue(row[field])).join(LABEL_JOINER);
}

/** A cell as text: list values joined, an empty value as a dash. */
export function displayValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length ? value.map(displayValue).join(', ') : EMPTY_LABEL;
  }

  if (value === null || value === undefined || value === '') {
    return EMPTY_LABEL;
  }

  return String(value);
}

/** A column's label, or its field name when the report has no such column. */
export function columnLabel(
  field: string,
  columns: ReportPreviewColumn[]
): string {
  return columns.find((column) => column.field === field)?.label ?? field;
}

/** A cell as a number to plot; anything that is not a number is drawn as zero. */
export function toNumber(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(number) ? number : 0;
}

function cellKey(category: string, group: string): string {
  return `${category}\u0000${group}`;
}

function pushUnique(list: string[], value: string) {
  if (!list.includes(value)) {
    list.push(value);
  }
}
