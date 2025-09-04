import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type AnalysisModel from 'irene/models/analysis';
import DetailedAnalysesModel from 'irene/models/detailed-analyses';

export interface FileDetailsScreenshotsSignature {
  Args: {
    analysis: AnalysisModel;
  };
}

export default class FileDetailsScreenshotsComponent extends Component<FileDetailsScreenshotsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked currentIndex = 0;

  @tracked screenshots: DetailedAnalysesModel[] = [];

  constructor(owner: unknown, args: FileDetailsScreenshotsSignature['Args']) {
    super(owner, args);

    if (this.analysis?.id) {
      this.loadScreenshots.perform(this.analysis.id).then((screenshots) => {
        this.screenshots = screenshots;
      });
    }
  }

  get analysis() {
    return this.args.analysis || null;
  }

  get limit() {
    return 1;
  }

  get offset() {
    return this.currentIndex;
  }

  @action
  handlePrevNextClick(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (
      direction === 'next' &&
      this.currentIndex < this.screenshots.length - 1
    ) {
      this.currentIndex++;
    }
  }

  @action
  noop() {}

  loadScreenshots = task(async (id: string) => {
    const response = await this.store.query('detailed-analyses', id);

    return response.slice();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Screenshots': typeof FileDetailsScreenshotsComponent;
  }
}
