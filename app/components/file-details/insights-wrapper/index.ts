import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';

export interface FileDetailsInsightsWrapperSignature {
  Args: {
    file: FileModel;
    fileAnalyses: AnalysisOverviewModel[];
  };
}

export default class FileDetailsInsightsWrapperComponent extends Component<FileDetailsInsightsWrapperSignature> {
  @service declare intl: IntlService;

  @tracked selectedTab = 'scan_summary';

  get tabItems() {
    return [
      {
        id: 'scan_summary',
        label: this.intl.t('scanSummary'),
        component: 'file-details/scan-summary' as const,
      },
      {
        id: 'compliance_insights',
        label: this.intl.t('owaspDetails'),
        component: 'file-details/compliance-insights' as const,
      },
    ];
  }

  get activeTabComponent() {
    return this.tabItems.find((t) => t.id === this.selectedTab)?.component;
  }

  @action
  handleTabClick(id: string | number) {
    this.selectedTab = id as string;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::InsightsWrapper': typeof FileDetailsInsightsWrapperComponent;
  }
}
