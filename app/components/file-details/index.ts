import Store from '@ember-data/store';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';

import type FileModel from 'irene/models/file';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';

export interface FileDetailsSignature {
  Args: { file: FileModel };
}

export default class FileDetailsComponent extends Component<FileDetailsSignature> {
  @service declare store: Store;
  @tracked fileAnalyses: AnalysisOverviewModel[] = [];

  constructor(owner: unknown, args: FileDetailsSignature['Args']) {
    super(owner, args);

    this.fetchFileAnalyses.perform();
  }

  fetchFileAnalyses = task(async () => {
    const fileAnalyses = await this.store.query('analysis-overview', {
      fileId: this.args.file.id,
    });

    this.fileAnalyses = fileAnalyses.slice();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileDetails: typeof FileDetailsComponent;
  }
}
