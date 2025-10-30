import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';

import FileModel from 'irene/models/file';
import type OrganizationService from 'irene/services/organization';
import type FileRiskModel from 'irene/models/file-risk';

export interface FileDetailsScanActionsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsComponent extends Component<FileDetailsScanActionsSignature> {
  @service declare organization: OrganizationService;

  @tracked fileRisk: FileRiskModel | null = null;

  constructor(owner: unknown, args: FileDetailsScanActionsSignature['Args']) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get isManualScanDisabled() {
    return !this.args.file.project.get('isManualScanAvailable');
  }

  get isAPIScanEnabled() {
    return this.args.file.project.get('isAPIScanEnabled');
  }

  get riskCountByScanType() {
    return (
      this.fileRisk?.get('riskCountByScanType') || {
        static: null,
        dynamic: null,
        api: null,
        manual: null,
      }
    );
  }

  fetchFileRisk = task(async () => {
    this.fileRisk = await this.args.file.fetchFileRisk();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions': typeof FileDetailsScanActionsComponent;
  }
}
