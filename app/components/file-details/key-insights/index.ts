import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';

import {
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type FileModel from 'irene/models/file';

export interface FileDetailsKeyInsightsSignature {
  Args: {
    file: FileModel;
  };
}

type KeyInsight = { label: string; value?: number };

export default class FileDetailsKeyInsightsComponent extends Component<FileDetailsKeyInsightsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get currentFile() {
    return this.args.file;
  }

  get showUnknownAnalysis() {
    return this.currentFile.project.get('showUnknownAnalysis');
  }

  get hasComparison() {
    return this.comparison !== null;
  }

  get previousFile() {
    return this.currentFile.get('previousFile').content;
  }

  get compareRouteModel() {
    return `${this.currentFile.id}...${this.previousFile?.id}`;
  }

  get keyInsights() {
    return [
      {
        label: this.intl.t('fileCompare.recurringIssues'),
        value: this.comparison?.recurring.length,
      },
      {
        label: this.intl.t('fileCompare.newIssues'),
        value: this.comparison?.newRisks.length,
      },
      {
        label: this.intl.t('fileCompare.resolvedIssues'),
        value: this.comparison?.resolved.length,
      },
      this.showUnknownAnalysis && {
        label: this.intl.t('fileCompare.untestedIssues'),
        value: this.comparison?.untested.length,
      },
    ].filter(Boolean) as KeyInsight[];
  }

  get previousFileUploadedOn() {
    return dayjs(this.previousFile?.createdOn).format('DD MMM YYYY');
  }

  get comparison() {
    return this.previousFile
      ? getFileComparisonCategories(
          compareFiles(this.currentFile, this.previousFile)
        )
      : null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::KeyInsights': typeof FileDetailsKeyInsightsComponent;
    'file-details/key-insights': typeof FileDetailsKeyInsightsComponent;
  }
}
