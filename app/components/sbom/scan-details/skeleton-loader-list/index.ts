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
