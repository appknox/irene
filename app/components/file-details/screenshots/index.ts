import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type AnalysisModel from 'irene/models/analysis';

export interface FileDetailsScreenshotsSignature {
  Args: {
    analysis: AnalysisModel;
  };
}

export default class FileDetailsScreenshotsComponent extends Component<FileDetailsScreenshotsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked currentIndex = 0;
  @tracked screenshots: string[] = [];
  @tracked isLoadingImage = true;

  private loadingImage: HTMLImageElement | null = null;

  constructor(owner: unknown, args: FileDetailsScreenshotsSignature['Args']) {
    super(owner, args);

    if (this.analysis?.id) {
      this.loadScreenshots.perform(this.analysis.id).then((screenshots) => {
        this.screenshots = screenshots;

        if (this.currentScreenshot) {
          this.loadImage(this.currentScreenshot);
        }
      });
    }
  }

  get analysis() {
    return this.args.analysis || null;
  }

  get limit() {
    return 1;
  }

  get currentScreenshot() {
    return this.screenshots[this.currentIndex] || null;
  }

  @action
  handleNextClick() {
    if (this.currentIndex < this.screenshots.length - 1) {
      this.currentIndex += 1;
      this.handleCurrentIndexChange();
    }
  }

  @action
  handlePrevClick() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.handleCurrentIndexChange();
    }
  }

  @action
  noop() {}

  @action
  async loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cleanupLoadingImage();

      const img = new Image();
      this.loadingImage = img;

      img.onload = () => {
        this.isLoadingImage = false;
        this.cleanupLoadingImage();
        resolve();
      };

      img.onerror = () => {
        this.isLoadingImage = false;
        this.cleanupLoadingImage();
        reject(new Error('Failed to load image'));
      };

      // Start loading the image
      img.src = src;
    });
  }

  private cleanupLoadingImage(): void {
    if (this.loadingImage) {
      this.loadingImage.onload = null;
      this.loadingImage.onerror = null;
      this.loadingImage = null;
    }
  }

  @action
  handleCurrentIndexChange() {
    // Reset loading state when changing images
    this.isLoadingImage = true;
    if (this.currentScreenshot) {
      this.loadImage(this.currentScreenshot);
    }
  }

  loadScreenshots = task(async (id: string) => {
    const response = await this.store.findRecord('detailed-analysis', id);

    return response.screenshots || [];
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Screenshots': typeof FileDetailsScreenshotsComponent;
  }
}
