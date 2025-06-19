import Component from '@glimmer/component';
import type ScanCoverageScreenModel from 'irene/models/scan-coverage-screen';

export interface FileDetailsDynamicScanResultsCoverageTableStatusSignature {
  Args: { coverage: ScanCoverageScreenModel };
}

export default class FileDetailsDynamicScanResultsCoverageTableStatus extends Component<FileDetailsDynamicScanResultsCoverageTableStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/results/coverage-table/status': typeof FileDetailsDynamicScanResultsCoverageTableStatus;
  }
}
