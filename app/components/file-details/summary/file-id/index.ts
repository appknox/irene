import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

export interface FileDetailsSummaryFileIdSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSummaryFileIdComponent extends Component<FileDetailsSummaryFileIdSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Summary::FileId': typeof FileDetailsSummaryFileIdComponent;
    'file-details/summary/file-id': typeof FileDetailsSummaryFileIdComponent;
  }
}
