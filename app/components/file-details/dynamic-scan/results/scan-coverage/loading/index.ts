import Component from '@glimmer/component';

export interface FileDetailsDynamicScanResultsScanCoverageLoadingSignature {
  Element: HTMLElement;
}

export default class FileDetailsDynamicScanResultsScanCoverageLoading extends Component<FileDetailsDynamicScanResultsScanCoverageLoadingSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::ScanCoverage::Loading': typeof FileDetailsDynamicScanResultsScanCoverageLoading;
  }
}
