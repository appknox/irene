import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { ReportChartControls } from 'irene/utils/ai-reporting/report-chart';

import {
  withSetting,
  type ReportChartSettings,
} from 'irene/utils/ai-reporting/report-chart-settings';

interface AiReportingPreviewChartCustomizeDisplayTabSignature {
  Args: {
    controls: ReportChartControls;
    settings: ReportChartSettings;
    onChange: (settings: ReportChartSettings) => void;
  };
}

type Section = 'goal' | 'line' | 'number' | 'pie';
type TopChoice = 'values' | 'legend' | 'sort';
type TopToggle = 'stackPercent' | 'trendLine';

const AUTO_DECIMALS = 'auto';

/** Labels, legend, sort, stacking, goal and trend lines, line style, pie options and number format. */
export default class AiReportingPreviewChartCustomizeDisplayTabComponent extends Component<AiReportingPreviewChartCustomizeDisplayTabSignature> {
  @service declare intl: IntlService;

  get valuesOptions() {
    return this.options('values', ['auto', 'all', 'off']);
  }

  get legendOptions() {
    return this.options('legend', ['auto', 'on', 'off']);
  }

  get sortOptions() {
    return this.options('sort', ['default', 'desc', 'asc']);
  }

  get shapeOptions() {
    return this.options('lineShape', ['straight', 'curved', 'step']);
  }

  get lineStyleOptions() {
    return this.options('lineStyle', ['solid', 'dashed', 'dotted']);
  }

  get widthOptions() {
    return this.options('lineWidth', ['small', 'medium', 'large']);
  }

  get dotsOptions() {
    return this.options('dots', ['auto', 'on', 'off']);
  }

  get percentagesOptions() {
    return this.options('percentages', ['off', 'legend', 'chart', 'both']);
  }

  get decimalsOptions() {
    return [AUTO_DECIMALS, '0', '1', '2', '3'].map((value) => ({
      value,
      label:
        value === AUTO_DECIMALS
          ? this.intl.t('reportModule.chartSettings.auto')
          : value,
    }));
  }

  get selectedDecimals() {
    const decimals = this.args.settings.number.decimals;

    return decimals === null ? AUTO_DECIMALS : String(decimals);
  }

  get goalValue() {
    const value = this.args.settings.goal.value;

    return value === null ? '' : String(value);
  }

  get minSlicePercent() {
    return String(this.args.settings.pie.minSlicePercent || '');
  }

  get multiplyBy() {
    return String(this.args.settings.number.multiplyBy);
  }

  @action
  chooseTop(part: TopChoice, value: string) {
    this.args.onChange(
      withSetting(
        this.args.settings,
        part,
        value as ReportChartSettings[TopChoice]
      )
    );
  }

  @action
  toggleTop(part: TopToggle, _event: Event, checked?: boolean) {
    this.args.onChange(withSetting(this.args.settings, part, !!checked));
  }

  @action
  choose(section: Section, key: string, value: string) {
    this.patch(section, { [key]: value });
  }

  @action
  chooseDecimals(value: string) {
    this.patch('number', {
      decimals: value === AUTO_DECIMALS ? null : Number(value),
    });
  }

  @action
  toggle(section: Section, key: string, _event: Event, checked?: boolean) {
    this.patch(section, { [key]: !!checked });
  }

  @action
  text(section: Section, key: string, event: Event) {
    this.patch(section, { [key]: (event.target as HTMLInputElement).value });
  }

  @action
  number(section: Section, key: string, fallback: number | null, event: Event) {
    const raw = (event.target as HTMLInputElement).value.trim();
    const value = raw === '' ? fallback : Number(raw);

    this.patch(section, { [key]: Number.isFinite(value) ? value : fallback });
  }

  private patch(section: Section, patch: Record<string, unknown>) {
    this.args.onChange(
      withSetting(this.args.settings, section, patch as never)
    );
  }

  private options(group: string, values: string[]) {
    return values.map((value) => ({
      value,
      label: this.intl.t(`reportModule.chartSettings.${group}.${value}`),
    }));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Chart::Customize::DisplayTab': typeof AiReportingPreviewChartCustomizeDisplayTabComponent;
  }
}
