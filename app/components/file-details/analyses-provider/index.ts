import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type Store from 'ember-data/store';
import { debounceTask } from 'ember-lifeline';

import type FileModel from 'irene/models/file';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type EventBusService from 'irene/services/event-bus';
import type LoggerService from 'irene/services/logger';

export interface FileDetailsAnalysesProviderContext {
  analyses: AnalysisOverviewModel[];
  isFetchingAnalyses: boolean;
  allAnalysesCVSSAreLatest: boolean;
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
  @service declare logger: LoggerService;

  @tracked analyses: AnalysisOverviewModel[] = [];

  // New analyses arriving over the websocket are added in one go.
  pendingAnalyses: AnalysisOverviewModel[] = [];

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

  get allAnalysesCVSSAreLatest() {
    return this.analyses.every(
      (a) => Number(a.activeCvssVersion) === Number(a.cvssVersion)
    );
  }

  @action
  handleAnalysisUpdate(aom: AnalysisOverviewModel) {
    // Return if newly created analysis is not for this file
    if (this.file.id !== aom.file.get('id')) {
      return;
    }

    const analysisExistsInFile =
      this.analyses.some((a) => a.id === aom.id) ||
      this.pendingAnalyses.some((a) => a.id === aom.id);

    // Update analyses list any time a new analysis is created or updated
    if (!analysisExistsInFile) {
      this.pendingAnalyses.push(aom);

      debounceTask(this, 'flushPendingAnalyses', 200);
    }
  }

  flushPendingAnalyses() {
    const known = new Set(this.analyses.map((a) => a.id));
    const added = this.pendingAnalyses.filter((a) => !known.has(a.id));

    this.pendingAnalyses = [];

    if (added.length) {
      this.analyses = [...this.analyses, ...added];
    }
  }

  fetchFileAnalyses = task(async () => {
    try {
      const analyses = await this.store.query('analysis-overview', {
        fileId: this.file.id,
      });

      this.analyses = analyses.slice();
    } catch (error) {
      const err = error as AdapterError;
      const errorStatus = err.errors?.[0]?.status;
      const isRateLimitError = Number(errorStatus) === 429;

      if (!isRateLimitError) {
        this.logger.error(
          `Failed to fetch analyses for file - ${this.file.id}`,
          error
        );
      }
    }
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
