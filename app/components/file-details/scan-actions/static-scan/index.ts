import Component from '@glimmer/component';

import FileModel from 'irene/models/file';

export interface FileDetailsScanActionsStaticScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsStaticScanComponent extends Component<FileDetailsScanActionsStaticScanSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::StaticScan': typeof FileDetailsScanActionsStaticScanComponent;
    'file-details/scan-actions/static-scan': typeof FileDetailsScanActionsStaticScanComponent;
  }
}
