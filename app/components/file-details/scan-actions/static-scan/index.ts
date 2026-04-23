import Component from '@glimmer/component';
import FileModel from 'irene/models/file';
import type { CopilotScanStatus } from 'irene/adapters/file';

export interface FileDetailsScanActionsStaticScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
    copilotStatus?: CopilotScanStatus;
  };
}

export default class FileDetailsScanActionsStaticScanComponent extends Component<FileDetailsScanActionsStaticScanSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::StaticScan': typeof FileDetailsScanActionsStaticScanComponent;
    'file-details/scan-actions/static-scan': typeof FileDetailsScanActionsStaticScanComponent;
  }
}
