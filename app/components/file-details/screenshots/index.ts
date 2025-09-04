import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type AnalysisModel from 'irene/models/analysis';

export interface FileDetailsScreenshotsSignature {
  Args: {
    analysis: AnalysisModel;
  };
}

export default class FileDetailsScreenshotsComponent extends Component<FileDetailsScreenshotsSignature> {
  @service declare intl: IntlService;
  @tracked currentIndex = 0;

  get analysis() {
    return this.args.analysis || null;
  }

  get screenshots() {
    return [
      'https://picsum.photos/200/300?random=1',
      'https://picsum.photos/200/300?random=2',
    ];
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
  noop() {
    // No operation function for pagination callbacks
    return;
  }

  get limit() {
    return 1; // Show one screenshot at a time
  }

  get offset() {
    return this.currentIndex;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Screenshots': typeof FileDetailsScreenshotsComponent;
  }
}
