import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type Store from '@ember-data/store';

import type FileModel from 'irene/models/file';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type EventBusService from 'irene/services/event-bus';

export interface FileDetailsAnalysesProviderContext {
  analyses: AnalysisOverviewModel[];
  isFetchingAnalyses: boolean;
}

interface FileDetailsAnalysesProviderComponentSignature {
  Args: { file: FileModel };
  Blocks: {
    default: [FileDetailsAnalysesProviderContext];
  };
}

export default class FileDetailsAnalysesProviderComponent extends Component<FileDetailsAnalysesProviderComponentSignature> {
  @service declare store: Store;
  @service declare eventBus: EventBusService;

  @tracked analyses: AnalysisOverviewModel[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsAnalysesProviderComponentSignature['Args']
  ) {
    super(owner, args);

    this.fetchFileAnalyses.perform();

    // Handle websocket analysis messages
    this.eventBus.on(
      'ws:analysis-overview:update',
      this,
      this.handleAnalysisUpdate
    );
  }

  get file() {
    return this.args.file;
  }

  @action
  handleAnalysisUpdate(aom: AnalysisOverviewModel) {
    // Return if newly created analysis is not for this file
    if (this.file.id !== aom.file.get('id')) {
      return;
    }

    const analysisExistsInFile = this.analyses.find((a) => a.id === aom.id);

    // Update analyses list any time a new analysis is created or updated
    if (!analysisExistsInFile) {
      this.analyses = [...this.analyses, aom];
    }
  }

  fetchFileAnalyses = task(async () => {
    const analyses = await this.store.query('analysis-overview', {
      fileId: this.file.id,
    });

    this.analyses = analyses.slice();
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
    'FileDetails::AnalysesProvider': typeof FileDetailsAnalysesProviderComponent;
  }
}
