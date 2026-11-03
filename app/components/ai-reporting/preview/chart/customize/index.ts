import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type {
  ReportChartControls,
  ReportChartItem,
} from 'irene/utils/ai-reporting/report-chart';

import type { ReportChartSettings } from 'irene/utils/ai-reporting/report-chart-settings';

type CustomizeTab = 'data' | 'display' | 'axes';

interface AiReportingPreviewChartCustomizeSignature {
  Args: {
    items: ReportChartItem[];
    controls: ReportChartControls;
    settings: ReportChartSettings;
    defaultTitles: { x: string; y: string };
    onChange: (settings: ReportChartSettings) => void;
    onReset: () => void;
    onClose: () => void;
  };
}

/** The chart's settings panel, beside the chart like the analytics editor: Data, Display and Axes tabs. */
export default class AiReportingPreviewChartCustomizeComponent extends Component<AiReportingPreviewChartCustomizeSignature> {
  @service declare intl: IntlService;

  @tracked selectedTab: CustomizeTab = 'data';

  get tabs() {
    const tabs: CustomizeTab[] = this.args.controls.axes
      ? ['data', 'display', 'axes']
      : ['data', 'display'];

    return tabs.map((id) => ({
      id,
      label: this.intl.t(`reportModule.chartSettings.tabs.${id}`),
    }));
  }

  /** The picked tab, or Data when the chart has no axes to set. */
  get activeTab(): CustomizeTab {
    return this.selectedTab === 'axes' && !this.args.controls.axes
      ? 'data'
      : this.selectedTab;
  }

  @action
  selectTab(id: number | string) {
    this.selectedTab = id as CustomizeTab;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::Chart::Customize': typeof AiReportingPreviewChartCustomizeComponent;
  }
}
