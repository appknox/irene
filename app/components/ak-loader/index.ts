import Component from '@glimmer/component';

export type AkLoaderColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warn'
  | 'warn-dark'
  | 'info'
  | 'info-dark';

export interface AkLoaderCommonArgs {
  progress?: number;
  variant?: 'determinate' | 'indeterminate';
  color?: AkLoaderColor;
}

export interface AkLoaderArgs extends AkLoaderCommonArgs {
  thickness?: number;
  size?: number;
}

export interface AkLoaderSignature {
  Element: HTMLSpanElement;
  Args: AkLoaderArgs;
  Blocks: { label: [] };
}

export default class AkLoader extends Component<AkLoaderSignature> {
  viewPortSize = 44;

  get size() {
    return this.args.size || 40;
  }

  get variant() {
    return this.args.variant || 'indeterminate';
  }

  get isIndeterminateLoader() {
    return this.variant === 'indeterminate';
  }

  // For a determinate loader
  get progress() {
    const progress = Number(this.args.progress);

    if (progress < 0) {
      return 0;
    }

    if (progress > 100) {
      return 100;
    }

    return progress;
  }

  get thickness() {
    return this.args.thickness || 4;
  }

  get radius() {
    return (this.viewPortSize - this.thickness) / 2;
  }

  get dashArray() {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset() {
    if (this.args.progress && !isNaN(this.progress)) {
      return this.dashArray * ((100 - this.progress) / 100);
    }

    return this.dashArray;
  }

  get viewBox() {
    return `${this.viewPortSize / 2} ${this.viewPortSize / 2} ${
      this.viewPortSize
    } ${this.viewPortSize}`;
  }

  get color() {
    return this.args.color || 'primary';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkLoader: typeof AkLoader;
  }
}
