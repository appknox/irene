/**
 * The ECharts option for a pie (drawn as a donut), with the viewer's settings
 * applied: slice names and colours, small slices grouped as "Other", the total
 * in the middle, labels, where percentages show, legend and number format.
 *
 * Plain functions with no Ember imports.
 */
import type { PieSeriesOption } from 'echarts/charts';

import type { ECOption } from 'irene/components/ak-chart';

import {
  formatChartNumber,
  type ReportChartSettings,
} from 'irene/utils/ai-reporting/report-chart-settings';

import {
  AXIS_TEXT_COLOR,
  REPORT_CHART_PALETTE,
  type ChartTable,
} from 'irene/utils/ai-reporting/report-chart-table';

interface PieSlice {
  name: string;
  value: number;
  color?: string;
}

interface PieLabelParams {
  name: string;
  percent?: number;
}

const OTHER_COLOR = '#B8BBC3';

/** A donut of the single total, as the viewer customised it. */
export function pieOption(
  table: ChartTable,
  settings: ReportChartSettings
): ECOption {
  const slices = pieSlices(table, settings);
  const sum = slices.reduce((acc, slice) => acc + slice.value, 0);
  const share = new Map(slices.map((slice) => [slice.name, slice.value]));

  const pie = settings.pie;
  const legend = settings.legend !== 'off';
  const center = legend ? '62%' : '50%';
  const format = (value: unknown) => formatChartNumber(value, settings.number);

  const series: PieSeriesOption = {
    type: 'pie',
    name: table.yName,
    radius: ['50%', '78%'],
    center: [center, '50%'],
    label: sliceLabel(settings),
    data: slices.map((slice) => ({
      name: slice.name,
      value: slice.value,
      ...(slice.color ? { itemStyle: { color: slice.color } } : {}),
    })),
  };

  const inLegend = pie.percentages === 'legend' || pie.percentages === 'both';

  return {
    color: REPORT_CHART_PALETTE,
    textStyle: { fontFamily: 'inherit' },
    tooltip: { trigger: 'item', valueFormatter: (value) => format(value) },
    legend: {
      show: legend,
      type: 'scroll',
      orient: 'vertical',
      icon: 'circle',
      left: 16,
      top: 'middle',
      formatter: (name: string) =>
        inLegend ? `${name}  ${percent(share.get(name), sum)}` : name,
    },
    title: {
      show: pie.total,
      text: format(sum),
      subtext: table.yName,
      left: center,
      top: 'middle',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      itemGap: 4,
      textStyle: { fontSize: 28, fontWeight: 'bold' },
      subtextStyle: { fontSize: 13, color: AXIS_TEXT_COLOR },
    },
    series: [series],
  };
}

/** The slices, with those below the viewer's minimum share drawn together as one "Other" slice. */
function pieSlices(
  table: ChartTable,
  settings: ReportChartSettings
): PieSlice[] {
  const values = table.series[0]?.data ?? [];
  const sum = values.reduce((acc, value) => acc + value, 0);
  const threshold = settings.pie.minSlicePercent;

  const slices = table.categories.map((name, i) => ({
    name,
    value: values[i] ?? 0,
    color: table.categoryColors?.[i],
  }));

  if (!threshold || !sum) {
    return slices;
  }

  const kept = slices.filter((slice) => (slice.value / sum) * 100 >= threshold);
  const small = slices.filter((slice) => !kept.includes(slice));

  if (small.length < 2) {
    return slices;
  }

  const other = small.reduce((acc, slice) => acc + slice.value, 0);

  return [
    ...kept,
    { name: settings.text.other, value: other, color: OTHER_COLOR },
  ];
}

/** Slice labels: the name, the share, or both, as the viewer chose. */
function sliceLabel(settings: ReportChartSettings) {
  const pie = settings.pie;
  const onChart = pie.percentages === 'chart' || pie.percentages === 'both';

  return {
    show: pie.labels || onChart,
    position: 'outside' as const,
    formatter: ({ name, percent: share }: PieLabelParams) => {
      const parts = [
        pie.labels ? name : '',
        onChart ? `${(share ?? 0).toFixed(1)}%` : '',
      ];

      return parts.filter(Boolean).join(': ');
    },
  };
}

function percent(value: number | undefined, sum: number): string {
  if (!sum || value === undefined) {
    return '0%';
  }

  return `${((value / sum) * 100).toFixed(1)}%`;
}
