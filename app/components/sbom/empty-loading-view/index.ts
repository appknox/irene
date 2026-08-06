import Component from '@glimmer/component';

import type { SbomScanDetailsSkeletonLoaderListColumn } from 'irene/components/sbom/scan-details/skeleton-loader-list';

export interface SbomEmptyLoadingViewSignature {
  Args: {
    empty: boolean;
    loading: boolean;
    tree?: 'filtered' | 'full';
    skeleton?: boolean;
    /* Headings for the list skeleton -- pass the same columns the real table
       renders, so the two don't disagree while loading. */
    skeletonColumns?: SbomScanDetailsSkeletonLoaderListColumn[];
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

  /**
   * A skeleton table has to fill the box from the top-left, but the empty and
   * loading states centre their svg and text. Driven through AkStack's own
   * args rather than CSS, because the alignment classes AkStack always emits
   * are exactly as specific as this component's stylesheet -- overriding them
   * from here would come down to bundle order.
   *
   * Keyed on a skeleton actually being on screen, not on the caller merely
   * opting into skeleton loading: `@skeleton={{true}}` with `@empty` must
   * still centre.
   */
  get contentAlignment() {
    return this.args.loading && this.skeleton ? 'flex-start' : 'center';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::EmptyLoadingView': typeof SbomEmptyLoadingViewComponent;
  }
}
