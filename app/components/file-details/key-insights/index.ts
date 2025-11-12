import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import {
  compareFileAnalyses,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

import type FileModel from 'irene/models/file';
import type UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';

export interface FileDetailsKeyInsightsSignature {
  Args: {
    file: FileModel;
    fileAnalyses: AnalysisOverviewModel[];
    isFetchingFileAnalyses: boolean;
  };
}

type KeyInsight = { label: string; value?: number };

export default class FileDetailsKeyInsightsComponent extends Component<FileDetailsKeyInsightsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked unknownAnalysisStatus?: UnknownAnalysisStatusModel;
  @tracked previousFileAnalyses: AnalysisOverviewModel[] = [];
  @tracked previousFile?: FileModel | null = null;

  constructor(owner: unknown, args: FileDetailsKeyInsightsSignature['Args']) {
    super(owner, args);

    this.fetchUnknownAnalysisStatus.perform();
    this.getPreviousFileAndAnalyses.perform();
  }

  get currentFile() {
    return this.args.file;
  }

  get hasComparison() {
    return this.comparison !== null;
  }

  get compareRouteModel() {
    return `${this.currentFile.id}...${this.previousFile?.id}`;
  }

  get isLoadingAnalysesData() {
    return (
      this.args.isFetchingFileAnalyses ||
      this.getPreviousFileAndAnalyses.isRunning
    );
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
      this.unknownAnalysisStatus?.status && {
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
          compareFileAnalyses(this.args.fileAnalyses, this.previousFileAnalyses)
        )
      : null;
  }

  fetchUnknownAnalysisStatus = task(async () => {
    this.unknownAnalysisStatus = await this.store.queryRecord(
      'unknown-analysis-status',
      {
        id: this.args.file.profile.get('id'),
      }
    );
  });

  getPreviousFileAndAnalyses = task(async () => {
    const previousFile = await this.args.file.fetchPreviousFile();
    this.previousFile = previousFile;

    if (previousFile) {
      const previousFileAnalyses = await this.store.query('analysis-overview', {
        fileId: previousFile.id,
      });

      this.previousFileAnalyses = previousFileAnalyses.slice();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::KeyInsights': typeof FileDetailsKeyInsightsComponent;
    'file-details/key-insights': typeof FileDetailsKeyInsightsComponent;
  }
}
