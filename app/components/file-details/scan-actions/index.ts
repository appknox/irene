import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import FileModel from 'irene/models/file';
import OrganizationService from 'irene/services/organization';

export interface FileDetailsScanActionsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsComponent extends Component<FileDetailsScanActionsSignature> {
  @service declare organization: OrganizationService;

  get isManualScanDisabled() {
    return !this.args.file.project.get('isManualScanAvailable');
  }

  get isAPIScanEnabled() {
    return this.args.file.project.get('isAPIScanEnabled');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions': typeof FileDetailsScanActionsComponent;
  }
}
