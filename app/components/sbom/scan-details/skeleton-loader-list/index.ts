import Component from '@glimmer/component';

export interface SbomScanDetailsSkeletonLoaderListColumn {
  name?: string;
  width?: number;
}

export interface SbomScanDetailsSkeletonLoaderListSignature {
  Args: {
    columns: SbomScanDetailsSkeletonLoaderListColumn[];
  };
}

// Headings come from whichever table this skeleton stands in for -- the SBOM
// list, its AI-filtered variant and the AI BoM list all have different
// columns, so a hardcoded set here would show the wrong headings for two of
// the three and make them shift once real data arrives.
export default class SbomScanDetailsSkeletonLoaderListComponent extends Component<SbomScanDetailsSkeletonLoaderListSignature> {
  get loadingMockData() {
    return new Array(8).fill({});
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::SkeletonLoaderList': typeof SbomScanDetailsSkeletonLoaderListComponent;
  }
}
