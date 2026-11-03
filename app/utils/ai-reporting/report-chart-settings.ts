/**
 * The viewer's customisations of an AI report chart: names, colours, axes,
 * number format, line style, goal and trend lines, pie options.
 *
 * Plain data and functions with no Ember imports. Settings live on the page
 * only (they are not saved); every field has a default that draws the chart
 * exactly as the report picked it.
 */

const EMPTY_LABEL = '—';

export type ValuesMode = 'auto' | 'all' | 'off';
export type LegendMode = 'auto' | 'on' | 'off';
export type SortMode = 'default' | 'desc' | 'asc';
export type SeriesDisplay = 'default' | 'bar' | 'line' | 'area';
export type LineShape = 'straight' | 'curved' | 'step';
export type LineStyleType = 'solid' | 'dashed' | 'dotted';
export type LineWidth = 'small' | 'medium' | 'large';
export type DotsMode = 'auto' | 'on' | 'off';
export type PiePercentages = 'off' | 'legend' | 'chart' | 'both';

/** One series (or pie slice, or number tile) as the viewer renamed or restyled it. */
export interface SeriesSettings {
  name: string;
  color: string;
  display: SeriesDisplay;
  rightAxis: boolean;
}

export interface AxisSettings {
  show: boolean;
  // null keeps the column's own label
  title: string | null;
  labels: boolean;
}

export interface ValueAxisSettings extends AxisSettings {
  min: number | null;
  max: number | null;
  log: boolean;
  gridLines: boolean;
}

export interface NumberSettings {
  // null shows up to two decimals, only where the value has them
  decimals: number | null;
  separators: boolean;
  compact: boolean;
  prefix: string;
  suffix: string;
  multiplyBy: number;
}

export interface LineSettings {
  shape: LineShape;
  style: LineStyleType;
  width: LineWidth;
  dots: DotsMode;
}

export interface PieSettings {
  total: boolean;
  labels: boolean;
  percentages: PiePercentages;
  // slices smaller than this share of the total are drawn as one "Other" slice
  minSlicePercent: number;
}

export interface GoalSettings {
  show: boolean;
  value: number | null;
  label: string;
}

/** Words the chart itself draws, so the page can pass them in its own language. */
export interface ChartText {
  other: string;
  trend: string;
}

export interface ReportChartSettings {
  series: Record<string, Partial<SeriesSettings>>;
  values: ValuesMode;
  legend: LegendMode;
  sort: SortMode;
  stackPercent: boolean;
  trendLine: boolean;
  goal: GoalSettings;
  line: LineSettings;
  xAxis: AxisSettings;
  yAxis: ValueAxisSettings;
  number: NumberSettings;
  pie: PieSettings;
  text: ChartText;
}

/** Settings that draw the chart exactly as the report picked it. */
export function defaultChartSettings(
  text: Partial<ChartText> = {}
): ReportChartSettings {
  return {
    series: {},
    values: 'auto',
    legend: 'auto',
    sort: 'default',
    stackPercent: false,
    trendLine: false,
    goal: { show: false, value: null, label: '' },
    line: { shape: 'straight', style: 'solid', width: 'medium', dots: 'auto' },
    xAxis: { show: true, title: null, labels: true },
    yAxis: {
      show: true,
      title: null,
      labels: true,
      min: null,
      max: null,
      log: false,
      gridLines: true,
    },
    number: {
      decimals: null,
      separators: true,
      compact: false,
      prefix: '',
      suffix: '',
      multiplyBy: 1,
    },
    pie: {
      total: true,
      labels: false,
      percentages: 'legend',
      minSlicePercent: 0,
    },
    text: { other: 'Other', trend: 'trend', ...text },
  };
}

type SettingsPart = Exclude<keyof ReportChartSettings, 'series'>;

/** settings with one part changed: a top-level value, or some fields of a section. */
export function withSetting<K extends SettingsPart>(
  settings: ReportChartSettings,
  part: K,
  value: ReportChartSettings[K] extends object
    ? Partial<ReportChartSettings[K]>
    : ReportChartSettings[K]
): ReportChartSettings {
  const current = settings[part];
  const next =
    typeof current === 'object' && current !== null
      ? { ...current, ...(value as object) }
      : value;

  return { ...settings, [part]: next };
}

/**
 * The viewer's settings for one series, slice or tile. Keys are data values
 * (an app or category name), so only the record's own entries count: a value
 * such as "constructor" must not pick up an inherited property.
 */
export function seriesSettings(
  settings: ReportChartSettings,
  key: string
): Partial<SeriesSettings> {
  return Object.prototype.hasOwnProperty.call(settings.series, key)
    ? (settings.series[key] as Partial<SeriesSettings>)
    : {};
}

/** settings with one series (or slice, or tile) renamed or restyled. */
export function withSeries(
  settings: ReportChartSettings,
  key: string,
  patch: Partial<SeriesSettings>
): ReportChartSettings {
  const series = {
    ...settings.series,
    [key]: { ...seriesSettings(settings, key), ...patch },
  };

  return { ...settings, series };
}

/** A number as the viewer formats it: scaled, with their decimals, separators, prefix and suffix. */
export function formatChartNumber(
  value: unknown,
  format: NumberSettings
): string {
  if (value === null || value === undefined || value === '') {
    return EMPTY_LABEL;
  }

  const number = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  const text = new Intl.NumberFormat(undefined, {
    useGrouping: format.separators,
    notation: format.compact ? 'compact' : 'standard',
    minimumFractionDigits: format.decimals ?? 0,
    maximumFractionDigits: format.decimals ?? 2,
  }).format(number * format.multiplyBy);

  return `${format.prefix}${text}${format.suffix}`;
}

/** The least-squares straight line through the values, one point per value. */
export function trendValues(values: number[]): number[] {
  const count = values.length;

  if (count < 2) {
    return [...values];
  }

  const meanX = (count - 1) / 2;
  const meanY = values.reduce((sum, value) => sum + value, 0) / count;

  let covariance = 0;
  let variance = 0;

  values.forEach((value, x) => {
    covariance += (x - meanX) * (value - meanY);
    variance += (x - meanX) ** 2;
  });

  const slope = variance ? covariance / variance : 0;

  return values.map((_, x) => round(meanY + slope * (x - meanX)));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
