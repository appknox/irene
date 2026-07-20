import Component from '@glimmer/component';

export default class StoreReleaseReadinessScanResultsSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::SkeletonLoader': typeof StoreReleaseReadinessScanResultsSkeletonLoaderComponent;
  }
}
