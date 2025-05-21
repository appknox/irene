import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';
import type ScanCoverageModel from 'irene/models/scan-coverage';

export interface FileDetailsDynamicScanResultsScanCoverageSignature {
  Args: {
    file: FileModel;
    scanCoverage: ScanCoverageModel | null;
    isOldFileWithNoCoverage: boolean;
  };
}

export default class FileDetailsDynamicScanResultsScanCoverage extends Component<FileDetailsDynamicScanResultsScanCoverageSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::ScanCoverage': typeof FileDetailsDynamicScanResultsScanCoverage;
  }
}
