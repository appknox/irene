import Component from '@glimmer/component';
import FileModel from 'irene/models/file';

export interface FileDetailsSeverityLevelSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSeverityLevelComponent extends Component<FileDetailsSeverityLevelSignature> {
  get profileId() {
    return this.args.file.profile;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SeverityLevel': typeof FileDetailsSeverityLevelComponent;
    'file-details/severity-level': typeof FileDetailsSeverityLevelComponent;
  }
}
