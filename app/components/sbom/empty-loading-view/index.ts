import Component from '@glimmer/component';

export interface SbomEmptyLoadingViewSignature {
  Args: {
    empty: boolean;
    loading: boolean;
    loadingSvgWidth?: string;
    loadingSvgHeight?: string;
    emptySvgWidth?: string;
    emptySvgHeight?: string;
    emptyText?: string;
    height?: string;
  };
  Blocks: {
    loadingSvg: [];
    emptySvg: [];
    emptyText: [];
    default: [];
  };
}

export default class SbomEmptyLoadingViewComponent extends Component<SbomEmptyLoadingViewSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::EmptyLoadingView': typeof SbomEmptyLoadingViewComponent;
  }
}
