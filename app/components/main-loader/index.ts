import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export interface MainLoaderSignature {
  Element: HTMLElement;
}

export default class MainLoaderComponent extends Component<MainLoaderSignature> {
  @tracked fakeProgress = 0;
  @tracked currentLoaderImageIndex = 0;

  loaderImages = [
    'ak-svg/main-loader-image1' as const,
    'ak-svg/main-loader-image2' as const,
    'ak-svg/main-loader-image3' as const,
  ];

  fakeProgressInterval: number | null = null;
  switchImageInterval: number | null = null;

  constructor(owner: unknown, args: any) {
    super(owner, args);

    this.generateFakeProgress();
  }

  @action
  generateFakeProgress() {
    this.fakeProgressInterval = setInterval(() => {
      if (this.fakeProgress < 100) {
        if (this.fakeProgress < 75) {
          this.fakeProgress += 75;
        } else if (this.fakeProgress < 85) {
          this.fakeProgress += 10;
        } else {
          this.fakeProgress += 5;
        }
      } else {
        if (this.fakeProgressInterval !== null) {
          clearInterval(this.fakeProgressInterval);
        }
      }
    }, 600);

    this.switchImage();
  }

  @action
  switchImage() {
    this.switchImageInterval = setInterval(() => {
      this.currentLoaderImageIndex =
        (this.currentLoaderImageIndex + 1) % this.loaderImages.length;
    }, 1000);
  }

  willDestroy() {
    super.willDestroy();

    if (this.fakeProgressInterval !== null) {
      clearInterval(this.fakeProgressInterval);
    }

    if (this.switchImageInterval !== null) {
      clearInterval(this.switchImageInterval);
    }
  }

  get currentLoaderImage() {
    return this.loaderImages[this.currentLoaderImageIndex];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    MainLoader: typeof MainLoaderComponent;
  }
}
