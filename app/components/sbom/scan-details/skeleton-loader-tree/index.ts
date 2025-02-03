import Component from '@glimmer/component';

export interface SbomScanDetailsSkeletonLoaderTreeSignature {
  Args: {
    isFilteredTree: boolean;
  };
}

export default class SbomScanDetailsSkeletonLoaderTreeComponent extends Component<SbomScanDetailsSkeletonLoaderTreeSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::SkeletonLoaderTree': typeof SbomScanDetailsSkeletonLoaderTreeComponent;
  }
}
