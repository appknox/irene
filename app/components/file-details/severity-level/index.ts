import Store from '@ember-data/store';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type FileModel from 'irene/models/file';

export interface FileDetailsSeverityLevelSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSeverityLevelComponent extends Component<FileDetailsSeverityLevelSignature> {
  @service declare store: Store;

  get fileRisk() {
    const fileId = this.args.file?.id;

    if (!fileId) {
      return null;
    }

    // Peek the store for the already-loaded risk
    return this.store.peekRecord('file-risk', String(fileId));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SeverityLevel': typeof FileDetailsSeverityLevelComponent;
    'file-details/severity-level': typeof FileDetailsSeverityLevelComponent;
  }
}
