import Component from '@glimmer/component';
import { action } from '@ember/object';

import {
  withSetting,
  type ReportChartSettings,
} from 'irene/utils/ai-reporting/report-chart-settings';

interface AiReportingPreviewChartCustomizeAxesTabSignature {
  Args: {
    settings: ReportChartSettings;
    defaultTitles: { x: string; y: string };
    onChange: (settings: ReportChartSettings) => void;
  };
}

type Axis = 'xAxis' | 'yAxis';

/** Show, rename and label both axes; range, log scale and grid lines for the value axis. */
export default class AiReportingPreviewChartCustomizeAxesTabComponent extends Component<AiReportingPreviewChartCustomizeAxesTabSignature> {
  get xTitle() {
    return this.args.settings.xAxis.title ?? this.args.defaultTitles.x;
  }

  get yTitle() {
    return this.args.settings.yAxis.title ?? this.args.defaultTitles.y;
  }

  get yMin() {
    return this.asText(this.args.settings.yAxis.min);
  }

  get yMax() {
    return this.asText(this.args.settings.yAxis.max);
  }

  @action
  toggle(axis: Axis, key: string, _event: Event, checked?: boolean) {
    this.patch(axis, { [key]: !!checked });
  }

  @action
  title(axis: Axis, event: Event) {
    this.patch(axis, { title: (event.target as HTMLInputElement).value });
  }

  @action
  bound(key: 'min' | 'max', event: Event) {
    const raw = (event.target as HTMLInputElement).value.trim();
    const value = raw === '' ? null : Number(raw);

    this.patch('yAxis', { [key]: Number.isFinite(value) ? value : null });
  }

  private patch(axis: Axis, patch: Record<string, unknown>) {
    this.args.onChange(withSetting(this.args.settings, axis, patch as never));
  }

  private asText(value: number | null) {
    return value === null ? '' : String(value);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Chart::Customize::AxesTab': typeof AiReportingPreviewChartCustomizeAxesTabComponent;
  }
}
