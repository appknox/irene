import Component from '@glimmer/component';

export interface AkSkeletonSignature {
  Element: HTMLElement;
  Args: {
    width?: string;
    height?: string;
    variant?: 'circular' | 'rectangular' | 'rounded';
    tag?: string;
  };
}

export default class AkSkeletonComponent extends Component<AkSkeletonSignature> {
  get tag() {
    return this.args.tag || 'span';
  }

  get variant() {
    return this.args.variant || 'rounded';
  }

  get width() {
    return this.args.width || 'auto';
  }

  get height() {
    return this.args.height || '1.2rem';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkSkeleton: typeof AkSkeletonComponent;
    'ak-skeleton': typeof AkSkeletonComponent;
  }
}
