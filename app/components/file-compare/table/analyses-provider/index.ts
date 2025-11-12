import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';

import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type EventBusService from 'irene/services/event-bus';
import type FileModel from 'irene/models/file';

import {
  compareFileAnalyses,
  FileComparisonItem,
  getFileComparisonCategories,
  type FileCompareFilterKey,
} from 'irene/utils/compare-files';

export interface FileCompareTableAnalysesProviderComponentContext {
  file1Analyses: AnalysisOverviewModel[];
  file2Analyses: AnalysisOverviewModel[];
  filteredComparisons: FileComparisonItem[];
  isLoadingAnalyses: boolean;
}

interface FileCompareTableAnalysesProviderComponentSignature {
  Args: {
    comparisonFilterKey: FileCompareFilterKey;
    files?: [file1: FileModel | null, file2: FileModel | null];
  };

  Blocks: {
    default: [FileCompareTableAnalysesProviderComponentContext];
  };
}

export default class FileCompareTableAnalysesProviderComponent extends Component<FileCompareTableAnalysesProviderComponentSignature> {
  @service declare store: Store;
  @service declare eventBus: EventBusService;

  @tracked file1Analyses: AnalysisOverviewModel[] = [];
  @tracked file2Analyses: AnalysisOverviewModel[] = [];

  constructor(
    owner: unknown,
    args: FileCompareTableAnalysesProviderComponentSignature['Args']
  ) {
    super(owner, args);

    this.getFilesAnalyses.perform();

    // Handle websocket analysis messages
    this.eventBus.on(
      'ws:analysis-overview:update',
      this,
      this.handleAnalysisUpdate
    );
  }

  get fileComparisons() {
    return getFileComparisonCategories(
      compareFileAnalyses(this.file1Analyses, this.file2Analyses)
    );
  }

  get filteredComparisons() {
    return this.fileComparisons[this.args.comparisonFilterKey];
  }

  @action
  handleAnalysisUpdate(aom: AnalysisOverviewModel) {
    const aomFileId = aom.file.get('id');
    const [file1, file2] = this.args.files || [];
    const fileIdsAndAnalyses = [file1?.id, file2?.id];

    const targetedFileIdx = fileIdsAndAnalyses.findIndex(
      (id) => String(aomFileId) === String(id)
    );

    // Return if newly created analysis is not for this file
    if (targetedFileIdx === -1) {
      return;
    }

    const isFile1 = targetedFileIdx === 0;
    const analyses = isFile1 ? this.file1Analyses : this.file2Analyses;
    const analysisExistsInFile = analyses.find((a) => a.id === aom.id);

    // Update analyses list any time a new analysis is created or updated
    if (!analysisExistsInFile) {
      this[isFile1 ? 'file1Analyses' : 'file2Analyses'] = [...analyses, aom];
    }
  }

  @action
  async fetchFileAnalyses(file: FileModel) {
    return await this.store.query('analysis-overview', {
      fileId: file.id,
    });
  }

  getFilesAnalyses = task(async () => {
    const [file1, file2] = this.args.files || [];

    // Fetch analyses only if files are available
    if (!file1 || !file2) {
      return;
    }

    const file1Analyses = await this.fetchFileAnalyses(file1);
    const file2Analyses = await this.fetchFileAnalyses(file2);

    this.file1Analyses = file1Analyses.slice();
    this.file2Analyses = file2Analyses.slice();
  });

  willDestroy(): void {
    super.willDestroy();

    // Handle websocket analysis messages
    this.eventBus.off(
      'ws:analysis-overview:update',
      this,
      this.handleAnalysisUpdate
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::Table::AnalysesProvider': typeof FileCompareTableAnalysesProviderComponent;
  }
}
