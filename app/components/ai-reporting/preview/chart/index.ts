import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkIconVariantType } from 'ak-icons';

import {
  reportChartAxisTitles,
  reportChartControls,
  reportChartItems,
  reportChartKinds,
  reportChartOption,
  reportChartTiles,
  type ReportChartKind,
} from 'irene/utils/ai-reporting/report-chart';

import {
  defaultChartSettings,
  type ReportChartSettings,
} from 'irene/utils/ai-reporting/report-chart-settings';

import type {
  ReportChart,
  ReportPreviewColumn,
  ReportPreviewData,
} from 'irene/models/ai-reporting/report-request';

const KIND_ICONS: Record<ReportChartKind, AkIconVariantType> = {
  number: 'numbers',
  bar: 'bar-chart',
  row: 'align-horizontal-left',
  line: 'show-chart',
  area: 'area-chart',
  pie: 'donut-large',
  stacked_bar: 'stacked-bar-chart',
  grouped_bar: 'bar-chart-4-bars',
};

interface AiReportingPreviewChartSignature {
  Args: {
    chart: ReportChart;
    rows: ReportPreviewData[];
    columns: ReportPreviewColumn[];
    kind?: ReportChartKind | null;
    onKindChange?: (kind: ReportChartKind) => void;
    settings?: ReportChartSettings;
    onSettingsChange?: (settings: ReportChartSettings) => void;
    onSettingsReset?: () => void;
  };
}

export default class AiReportingPreviewChartComponent extends Component<AiReportingPreviewChartSignature> {
  @service declare intl: IntlService;

  @tracked customizeOpen = false;

  get settings() {
    return this.args.settings ?? defaultChartSettings();
  }

  get canCustomize() {
    return !!this.args.onSettingsChange;
  }

  get controls() {
    return reportChartControls(this.args.chart, this.activeKind, this.settings);
  }

  get items() {
    return reportChartItems(
      this.args.chart,
      this.args.rows,
      this.args.columns,
      this.activeKind
    );
  }

  get defaultTitles() {
    return reportChartAxisTitles(
      this.args.chart,
      this.args.columns,
      this.activeKind
    );
  }

  get kinds() {
    return reportChartKinds(this.args.chart).map((id) => ({
      id,
      icon: KIND_ICONS[id],
      label: this.intl.t(`reportModule.chartKinds.${id}`),
    }));
  }

  get hasKindChoices() {
    return this.kinds.length > 1;
  }

  /** The chosen kind when it fits these rows, otherwise the report's default chart. */
  get activeKind(): ReportChartKind {
    const kind = this.args.kind;

    return kind && reportChartKinds(this.args.chart).includes(kind)
      ? kind
      : this.args.chart.type;
  }

  get isNumber() {
    return this.activeKind === 'number';
  }

  get tiles() {
    return reportChartTiles(
      this.args.chart,
      this.args.rows,
      this.args.columns,
      this.settings
    );
  }

  get option() {
    return reportChartOption(
      this.args.chart,
      this.args.rows,
      this.args.columns,
      this.activeKind,
      this.settings
    );
  }

  @action
  selectKind(kind: ReportChartKind) {
    this.args.onKindChange?.(kind);
  }

  @action
  toggleCustomize() {
    this.customizeOpen = !this.customizeOpen;
  }

  @action
  closeCustomize() {
    this.customizeOpen = false;
  }

  @action
  changeSettings(settings: ReportChartSettings) {
    this.args.onSettingsChange?.(settings);
  }

  @action
  resetSettings() {
    this.args.onSettingsReset?.();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Chart': typeof AiReportingPreviewChartComponent;
  }
}
