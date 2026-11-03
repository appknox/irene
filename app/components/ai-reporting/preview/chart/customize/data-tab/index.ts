import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import {
  REPORT_CHART_PALETTE,
  type ReportChartControls,
  type ReportChartItem,
} from 'irene/utils/ai-reporting/report-chart';

import {
  seriesSettings,
  withSeries,
  type ReportChartSettings,
  type SeriesDisplay,
} from 'irene/utils/ai-reporting/report-chart-settings';

interface AiReportingPreviewChartCustomizeDataTabSignature {
  Args: {
    items: ReportChartItem[];
    controls: ReportChartControls;
    settings: ReportChartSettings;
    onChange: (settings: ReportChartSettings) => void;
  };
}

const DISPLAYS: SeriesDisplay[] = ['default', 'bar', 'line', 'area'];

/** Rename and recolour each series, slice or tile; pick bar, line or area and the axis per series. */
export default class AiReportingPreviewChartCustomizeDataTabComponent extends Component<AiReportingPreviewChartCustomizeDataTabSignature> {
  @service declare intl: IntlService;

  palette = REPORT_CHART_PALETTE;

  get heading() {
    return this.intl.t(
      `reportModule.chartSettings.items.${this.args.controls.items}`
    );
  }

  get displayOptions() {
    return DISPLAYS.map((value) => ({
      value,
      label: this.intl.t(`reportModule.chartSettings.display.${value}`),
    }));
  }

  nameOf = (item: ReportChartItem) =>
    seriesSettings(this.args.settings, item.key).name ?? item.label;

  colorOf = (item: ReportChartItem) =>
    seriesSettings(this.args.settings, item.key).color ?? '';

  displayOf = (item: ReportChartItem) =>
    seriesSettings(this.args.settings, item.key).display ?? 'default';

  onRightAxis = (item: ReportChartItem) =>
    !!seriesSettings(this.args.settings, item.key).rightAxis;

  @action
  rename(item: ReportChartItem, event: Event) {
    const name = (event.target as HTMLInputElement).value;

    this.update(item, { name });
  }

  @action
  pickColor(item: ReportChartItem, color: string) {
    this.update(item, { color });
  }

  @action
  pickCustomColor(item: ReportChartItem, event: Event) {
    this.update(item, { color: (event.target as HTMLInputElement).value });
  }

  @action
  pickDisplay(item: ReportChartItem, display: string) {
    this.update(item, { display: display as SeriesDisplay });
  }

  @action
  toggleRightAxis(item: ReportChartItem, _event: Event, checked?: boolean) {
    this.update(item, { rightAxis: !!checked });
  }

  private update(
    item: ReportChartItem,
    patch: Parameters<typeof withSeries>[2]
  ) {
    this.args.onChange(withSeries(this.args.settings, item.key, patch));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Chart::Customize::DataTab': typeof AiReportingPreviewChartCustomizeDataTabComponent;
  }
}
