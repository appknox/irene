import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import FileModel from 'irene/models/file';

export interface FileDetailsInsightsWrapperSignature {
  Args: {
    file: FileModel;
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
  handleTabClick(id: string) {
    this.selectedTab = id;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::InsightsWrapper': typeof FileDetailsInsightsWrapperComponent;
  }
}
