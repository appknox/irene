import Component from '@glimmer/component';

export interface FileDetailsDynamicScanNavigationGraphSkeletonLoaderSignature {
  Element: HTMLDivElement;
}

export default class FileDetailsDynamicScanNavigationGraphSkeletonLoaderComponent extends Component<FileDetailsDynamicScanNavigationGraphSkeletonLoaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph::SkeletonLoader': typeof FileDetailsDynamicScanNavigationGraphSkeletonLoaderComponent;
  }
}
