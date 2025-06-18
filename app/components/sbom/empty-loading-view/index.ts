import Component from '@glimmer/component';

export interface SbomEmptyLoadingViewSignature {
  Args: {
    empty: boolean;
    loading: boolean;
    tree?: 'filtered' | 'full';
    skeleton?: boolean;
    loadingSvgWidth?: string;
    loadingSvgHeight?: string;
    emptySvgWidth?: string;
    emptySvgHeight?: string;
    emptyText?: string;
    height?: string;
    bordered?: boolean;
  };
  Blocks: {
    loadingSvg: [];
    emptySvg: [];
    emptyText: [];
    default: [];
  };
}

export default class SbomEmptyLoadingViewComponent extends Component<SbomEmptyLoadingViewSignature> {
  get tree() {
    return this.args.tree ? true : false;
  }

  get isFilteredTree() {
    return this.args.tree === 'filtered';
  }

  get skeleton() {
    return this.args.skeleton ?? false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::EmptyLoadingView': typeof SbomEmptyLoadingViewComponent;
  }
}
