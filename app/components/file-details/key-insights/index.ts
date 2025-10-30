import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';

import FileModel from 'irene/models/file';
import UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';
import AnalysisModel from 'irene/models/analysis';

import {
  compareFileAnalyses,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsKeyInsightsSignature {
  Args: {
    file: FileModel;
    fileAnalyses: AnalysisModel[];
  };
}

type KeyInsight = { label: string; value?: number };

export default class FileDetailsKeyInsightsComponent extends Component<FileDetailsKeyInsightsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked unknownAnalysisStatus?: UnknownAnalysisStatusModel;
  @tracked previousFileAnalyses: AnalysisModel[] = [];
  @tracked previousFile?: FileModel | null = null;

  constructor(owner: unknown, args: FileDetailsKeyInsightsSignature['Args']) {
    super(owner, args);

    this.fetchUnknownAnalysisStatus.perform();
    this.getPreviousFile.perform();
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

  getPreviousFile = task(async () => {
    try {
      const previousFile = await this.args.file.fetchPreviousFile();
      this.previousFile = previousFile;

      if (previousFile) {
        const previousFileAnalyses = await this.store.query('analysis', {
          fileId: previousFile.id,
        });

        this.previousFileAnalyses = previousFileAnalyses.slice();
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::KeyInsights': typeof FileDetailsKeyInsightsComponent;
    'file-details/key-insights': typeof FileDetailsKeyInsightsComponent;
  }
}
