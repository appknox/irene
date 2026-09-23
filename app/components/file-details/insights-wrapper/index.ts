import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type { FileDetailsAnalysesProviderContext } from '../analyses-provider';

interface FileDetailsInsightsTab {
  id: string;
  label: string;
  component?: 'file-details/scan-summary' | 'file-details/compliance-insights';
  route?: string;
  model?: string;
  query?: Record<string, unknown>;
}

export interface FileDetailsInsightsWrapperSignature {
  Args: {
    file: FileModel;
    fileAnalysesListContext: FileDetailsAnalysesProviderContext;
  };
}

export default class FileDetailsInsightsWrapperComponent extends Component<FileDetailsInsightsWrapperSignature> {
  @service declare intl: IntlService;

  @tracked selectedTab = 'scan_summary';

  get tabItems(): FileDetailsInsightsTab[] {
    return [
      {
        id: 'scan_summary',
        label: this.intl.t('scanSummary'),
        component: 'file-details/scan-summary',
      },
      {
        id: 'compliance_insights',
        label: this.intl.t('owaspDetails'),
        component: 'file-details/compliance-insights',
      },
      {
        id: 'autofix',
        label: this.intl.t('autofix.fileLevel'),
        route: 'authenticated.dashboard.project.autofix',
        model: this.args.file.project.get('id'),
        query: { file_id: this.args.file.id },
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
