import Component from '@glimmer/component';
import { action } from '@ember/object';

import type FileModel from 'irene/models/file';

export interface FileDetailsDastManualSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastManual extends Component<FileDetailsDastManualSignature> {
  get file() {
    return this.args.file;
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
