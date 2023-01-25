import Component from '@glimmer/component';

export interface AkLoaderSignature {
  Element: HTMLSpanElement;
  Args: {
    thickness?: number;
    size?: number;
  };
}

export default class AkLoader extends Component<AkLoaderSignature> {
  viewPortSize = 44;

  get size() {
    return this.args.size || 40;
  }

  get thickness() {
    return this.args.thickness || 4;
  }

  get radius() {
    return (this.viewPortSize - this.thickness) / 2;
  }

  get viewBox() {
    return `${this.viewPortSize / 2} ${this.viewPortSize / 2} ${
      this.viewPortSize
    } ${this.viewPortSize}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkLoader: typeof AkLoader;
  }
}
