import Component from '@glimmer/component';

export interface SbomScanDetailsSkeletonLoaderTreeSignature {
  Args: {
    isFilteredTree: boolean;
  };
}

export default class SbomScanDetailsSkeletonLoaderTreeComponent extends Component<SbomScanDetailsSkeletonLoaderTreeSignature> {
  noop() {}

  expanded = ['placeholder-1'];

  skeletonTreeData = Array.from(
    { length: this.args.isFilteredTree ? 3 : 12 },
    (_, index) => ({
      key: `placeholder-${index + 1}`,
      title: '',
      children: [],
    })
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::SkeletonLoaderTree': typeof SbomScanDetailsSkeletonLoaderTreeComponent;
  }
}
