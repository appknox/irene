import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type AnalysisModel from 'irene/models/analysis';
import DetailedAnalysisModel from 'irene/models/detailed-analysis';

export interface FileDetailsScreenshotsSignature {
  Args: {
    analysis: AnalysisModel;
  };
}

export default class FileDetailsScreenshotsComponent extends Component<FileDetailsScreenshotsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  limit = 1;
  @tracked currentIndex = 0;
  @tracked screenshots: string[] = [];
  @tracked isLoadingImage = true;
  @tracked imageLoadError = false;

  private loadedImages = new Set<string>();
  private preloadingImages = new Map<string, HTMLImageElement>();

  constructor(owner: unknown, args: FileDetailsScreenshotsSignature['Args']) {
    super(owner, args);

    this.loadScreenshots.perform(this.analysis.id);
  }

  get analysis() {
    return this.args.analysis;
  }

  get currentScreenshot() {
    return this.screenshots[this.currentIndex] || null;
  }

  get nextScreenshot() {
    return this.screenshots[this.currentIndex + 1] || null;
  }

  get hasPrevious() {
    return this.currentIndex > 0;
  }

  get hasNext() {
    return this.currentIndex < this.screenshots.length - 1;
  }

  @action noop() {}

  @action
  handleNextClick() {
    if (this.hasNext) {
      this.currentIndex += 1;

      this.updateLoadingStateForCurrentImage();
      this.preloadNextImage();
    }
  }

  @action
  handlePrevClick() {
    if (this.hasPrevious) {
      this.currentIndex -= 1;

      this.updateLoadingStateForCurrentImage();
    }
  }

  @action
  updateLoadingStateForCurrentImage() {
    if (!this.currentScreenshot) {
      return;
    }

    // Only update loading state based on current image
    if (this.loadedImages.has(this.currentScreenshot)) {
      this.isLoadingImage = false;
      this.imageLoadError = false;
    } else {
      this.isLoadingImage = true;
      this.imageLoadError = false;
    }
  }

  @action
  loadCurrentImage(): void {
    const currentUrl = this.currentScreenshot;

    if (!currentUrl) {
      return;
    }

    if (
      this.loadedImages.has(currentUrl) ||
      this.preloadingImages.has(currentUrl)
    ) {
      return;
    }

    const img = new Image();

    this.preloadingImages.set(currentUrl, img);

    img.onload = () => {
      this.loadedImages.add(currentUrl);
      this.preloadingImages.delete(currentUrl);

      if (this.currentScreenshot === currentUrl && this.isLoadingImage) {
        this.isLoadingImage = false;
      }
    };

    img.onerror = () => {
      this.preloadingImages.delete(currentUrl);

      if (this.currentScreenshot === currentUrl && this.isLoadingImage) {
        this.imageLoadError = true;
        this.isLoadingImage = false;
      }
    };

    img.src = currentUrl;
  }

  @action
  preloadNextImage() {
    const nextUrl = this.nextScreenshot;

    if (!nextUrl) {
      return; // No next image to preload
    }

    if (this.loadedImages.has(nextUrl) || this.preloadingImages.has(nextUrl)) {
      return; // Already loaded or loading
    }

    const img = new Image();

    this.preloadingImages.set(nextUrl, img);

    img.onload = () => {
      this.loadedImages.add(nextUrl);
      this.preloadingImages.delete(nextUrl);

      // Only update state if user navigated to this image while it was loading
      if (this.currentScreenshot === nextUrl && this.isLoadingImage) {
        this.isLoadingImage = false;
      }
    };

    img.onerror = () => {
      this.preloadingImages.delete(nextUrl);

      // Only update state if user navigated to this image while it was loading
      if (this.currentScreenshot === nextUrl && this.isLoadingImage) {
        this.imageLoadError = true;
        this.isLoadingImage = false;
      }
    };

    // Silently load next image in background
    img.src = nextUrl;
  }

  private cleanupAllImages(): void {
    this.preloadingImages.forEach((img) => {
      img.onload = null;
      img.onerror = null;
    });

    this.preloadingImages.clear();
    this.loadedImages.clear();
  }

  loadScreenshots = task(async (id?: string) => {
    // If no id is provided, do nothing
    if (!id) {
      return;
    }

    const adapter = this.store.adapterFor('detailed-analysis');
    adapter.setNestedUrlNamespace(String(id));

    const response = (await this.store.queryRecord(
      'detailed-analysis',
      {}
    )) as DetailedAnalysisModel;

    this.screenshots = response.screenshots || [];

    this.loadCurrentImage();
    this.preloadNextImage();
  });

  // Cleanup all images when the component is destroyed
  willDestroy() {
    super.willDestroy();
    this.cleanupAllImages();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Screenshots': typeof FileDetailsScreenshotsComponent;
  }
}
