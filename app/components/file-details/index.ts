import Store from '@ember-data/store';
import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import AnalysisModel from 'irene/models/analysis';
import { tracked } from 'tracked-built-ins';

export interface FileDetailsSignature {
  Args: { file: FileModel };
}

export default class FileDetailsComponent extends Component<FileDetailsSignature> {
  @service declare store: Store;
  @tracked fileAnalyses: AnalysisModel[] = [];

  constructor(owner: unknown, args: FileDetailsSignature['Args']) {
    super(owner, args);

    this.fetchFileAnalyses.perform();
  }

  fetchFileAnalyses = task(async () => {
    const fileAnalyses = await this.store.query('analysis', {
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
