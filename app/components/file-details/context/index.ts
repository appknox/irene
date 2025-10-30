import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';

import ENUMS from 'irene/enums';
import type AnalysisModel from 'irene/models/analysis';
import type FileModel from 'irene/models/file';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Store from '@ember-data/store';

interface FileDetailsContext {
  isLoadingFileAnalysesData: boolean;
  fileAnalyses: AnalysisModel[];

  vulnerabilityCounts: {
    static: number;
    dynamic: number;
    api: number;
    manual: number;
  };
}

export interface FileDetailsContextSignature {
  Args: { file: FileModel };
  Blocks: { default: [context: FileDetailsContext] };
}

// TODO: Remove this component if not in use
export default class FileDetailsContextComponent extends Component<FileDetailsContextSignature> {
  @tracked fileAnalyses: AnalysisModel[] = [];
  @service declare store: Store;

  constructor(owner: object, args: FileDetailsContextSignature['Args']) {
    super(owner, args);

    this.loadFileAnalyses.perform();
  }

  get vulnerabilityCounts() {
    return this.fileAnalyses.reduce(
      (acc, analysis) => {
        // If the analysis is not risky, skip it
        if (!analysis.isRisky) {
          return acc;
        }

        // Count the number of static vulnerabilities
        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.STATIC)) {
          acc.static++;
        }

        // Count the number of dynamic vulnerabilities
        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.DYNAMIC)) {
          acc.dynamic++;
        }

        // Count the number of API vulnerabilities
        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.API)) {
          acc.api++;
        }

        // Count the number of manual vulnerabilities
        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.MANUAL)) {
          acc.manual++;
        }

        return acc;
      },
      { static: 0, dynamic: 0, api: 0, manual: 0 }
    );
  }

  @action
  reloadFileAnalyses() {
    this.fileAnalyses = [];
    this.loadFileAnalyses.perform();
  }

  loadFileAnalyses = task(async () => {
    const fileAnalyses = await this.store.query('analysis', {
      fileId: this.args.file.id,
    });

    this.fileAnalyses = fileAnalyses.slice();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Context': typeof FileDetailsContextComponent;
  }
}
