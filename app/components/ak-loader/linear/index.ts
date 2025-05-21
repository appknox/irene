import Component from '@glimmer/component';
import { AkLoaderCommonArgs } from '..';

interface AkLoaderLinearArgs extends AkLoaderCommonArgs {
  height?: number;
}

export interface AkLoaderLinearSignature {
  Element: HTMLElement;
  Args: AkLoaderLinearArgs;
  Blocks: { label?: [] };
}

export default class AkLoaderLinearComponent extends Component<AkLoaderLinearSignature> {
  get height() {
    return this.args.height || 5;
  }

  get variant() {
    return this.args.variant || 'indeterminate';
  }

  get isIndeterminateLoader() {
    return this.variant === 'indeterminate';
  }

  get progress() {
    const progress = Number(this.args.progress);

    if (progress < 0 || isNaN(progress)) {
      return 0;
    }

    if (progress > 100) {
      return 100;
    }

    return progress;
  }

  get progressIndicatorPositionStyle() {
    return {
      transform: `translateX(${this.progress}%)`,
    };
  }

  get color() {
    return this.args.color || 'primary';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkLoader::Linear': typeof AkLoaderLinearComponent;
  }
}
