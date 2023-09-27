import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

export interface FileDetailsScanSummarySignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanSummaryComponent extends Component<FileDetailsScanSummarySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanSummary': typeof FileDetailsScanSummaryComponent;
    'file-details/scan-summary': typeof FileDetailsScanSummaryComponent;
  }
}
