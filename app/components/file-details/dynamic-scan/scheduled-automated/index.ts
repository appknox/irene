import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';

import type DynamicScanService from 'irene/services/dynamic-scan';
import type FileModel from 'irene/models/file';

export interface FileDetailsDynamicScanScheduledAutomatedSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDynamicScanScheduledAutomatedComponent extends Component<FileDetailsDynamicScanScheduledAutomatedSignature> {
  @service declare router: RouterService;
  @service('dynamic-scan') declare dsService: DynamicScanService;

  get dynamicScan() {
    return this.dsService.scheduledScan;
  }

  get isFetchingDynamicScan() {
    return this.dsService.fetchLatestScheduledScan.isRunning;
  }

  get showStatusChip() {
    return !this.dynamicScan?.isReady;
  }

  get showActionButton() {
    return !this.dynamicScan?.isShuttingDown;
  }

  // cannot start from here in scheduled automated
  handleScanStart() {}

  @action
  handleScanShutdown() {
    this.router.transitionTo(
      'authenticated.dashboard.file.dynamic-scan.automated'
    );

    // this will make showScheduledScan false
    this.dsService.scheduledScan = null;

    this.args.file.reload();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::ScheduledAutomated': typeof FileDetailsDynamicScanScheduledAutomatedComponent;
  }
}
