import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type FileModel from 'irene/models/file';
import type DynamicScanService from 'irene/services/dynamic-scan';

export interface FileDetailsDastManualSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastManual extends Component<FileDetailsDastManualSignature> {
  @service('dynamic-scan') declare dsService: DynamicScanService;

  constructor(owner: unknown, args: FileDetailsDastManualSignature['Args']) {
    super(owner, args);

    // Poll the dynamic scan status if the project org is different from the selected org
    // Only necessary for the case where the file is being accessed by a superuser
    this.dsService.pollDynamicScanStatusForSuperUser({
      file: this.file,
      isAutomatedScan: false,
    });
  }

  get file() {
    return this.args.file;
  }

  get profileId() {
    return this.file.profile.get('id') as string;
  }

  get dynamicScan() {
    return this.file.lastManualDynamicScan;
  }

  get isFetchingDynamicScan() {
    return this.file.lastManualDynamicScan?.isPending;
  }

  get showStatusChip() {
    return !this.dynamicScan?.get('isReady');
  }

  get showActionButton() {
    return !this.dynamicScan?.get('isShuttingDown');
  }

  @action
  handleScanShutdown(closeFullscreen: () => void) {
    closeFullscreen();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Manual': typeof FileDetailsDastManual;
  }
}
