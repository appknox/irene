import Component from '@glimmer/component';

import FileModel from 'irene/models/file';

export interface FileDetailsScanActionsApiScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number;
  };
}

export default class FileDetailsScanActionsApiScanComponent extends Component<FileDetailsScanActionsApiScanSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ApiScan': typeof FileDetailsScanActionsApiScanComponent;
    'file-details/scan-actions/api-scan': typeof FileDetailsScanActionsApiScanComponent;
  }
}
