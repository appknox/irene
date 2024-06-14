import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import FileModel from 'irene/models/file';
import OrganizationService from 'irene/services/organization';

export interface FileDetailsScanActionsOldSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsOldComponent extends Component<FileDetailsScanActionsOldSignature> {
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
    'FileDetails::ScanActionsOld': typeof FileDetailsScanActionsOldComponent;
  }
}
