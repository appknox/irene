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

  @tracked selectedTab = 'severity_level';

  get tabItems() {
    return [
      {
        id: 'severity_level',
        label: this.intl.t('severityLevel'),
        component: 'file-details/severity-level' as const,
      },
      {
        id: 'compliance_insights',
        label: this.intl.t('complianceInsights'),
        component: 'file-details/compliance-insights' as const,
      },
      // {
      //   id: 'key_insights',
      //   label: 'Key Insights',
      //   component: 'file-details/key-insights' as const,
      // },
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
