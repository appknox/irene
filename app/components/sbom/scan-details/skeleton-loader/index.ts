import Component from '@glimmer/component';

export default class SbomScanDetailsSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::SkeletonLoader': typeof SbomScanDetailsSkeletonLoaderComponent;
  }
}
