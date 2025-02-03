import Component from '@glimmer/component';

export default class SbomScanDetailsSkeletonLoaderListComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::SkeletonLoaderList': typeof SbomScanDetailsSkeletonLoaderListComponent;
  }
}
