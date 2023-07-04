import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';

import FileModel from 'irene/models/file';
import { tracked } from '@glimmer/tracking';
import {
  FileComparisonCategories,
  compareFiles,
  getFileComparisonCategories,
} from 'irene/utils/compare-filles';
import dayjs from 'dayjs';

export interface FileDetailsKeyInsightsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsKeyInsightsComponent extends Component<FileDetailsKeyInsightsSignature> {
  @service declare store: Store;

  @tracked comparison: FileComparisonCategories | null = null;
  @tracked previousFile?: FileModel;

  constructor(owner: unknown, args: FileDetailsKeyInsightsSignature['Args']) {
    super(owner, args);

    this.fetchPrevFileAndCompare.perform();
  }

  get currentFile() {
    return this.args.file;
  }

  get hasComparison() {
    return this.comparison !== null;
  }

  get previousFileUploadedOn() {
    return dayjs(this.previousFile?.createdOn).format('DD MMM YYYY');
  }

  fetchPrevFileAndCompare = task(async () => {
    if (this.currentFile.project.get('hasMultipleFiles')) {
      this.previousFile = await this.store.findRecord(
        'file',
        parseInt(this.currentFile.id) - 1
      );

      this.comparison = getFileComparisonCategories(
        compareFiles(this.currentFile, this.previousFile)
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::KeyInsights': typeof FileDetailsKeyInsightsComponent;
    'file-details/key-insights': typeof FileDetailsKeyInsightsComponent;
  }
}
