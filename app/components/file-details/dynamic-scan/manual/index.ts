import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import type DynamicScanService from 'irene/services/dynamic-scan';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';

export interface FileDetailsDastManualSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastManual extends Component<FileDetailsDastManualSignature> {
  @service('dynamic-scan') declare dsService: DynamicScanService;

  get dynamicScan() {
    return this.dsService.manualScan;
  }

  get isFetchingDynamicScan() {
    return this.dsService.fetchLatestManualScan.isRunning;
  }

  get showStatusChip() {
    return !this.dynamicScan?.isReady;
  }

  get showActionButton() {
    return !this.dynamicScan?.isShuttingDown;
  }

  @action
  handleScanStart(dynamicScan: DynamicscanModel) {
    this.dsService.manualScan = dynamicScan;
  }

  @action
  handleScanShutdown(closeFullscreen: () => void) {
    closeFullscreen();

    this.dsService.fetchLatestManualScan.perform(this.args.file);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Manual': typeof FileDetailsDastManual;
  }
}
