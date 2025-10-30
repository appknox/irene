import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import type FileModel from 'irene/models/file';
import type DynamicScanService from 'irene/services/dynamic-scan';

import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';
import IntlService from 'ember-intl/services/intl';
import DynamicscanModel from 'irene/models/dynamicscan';

export interface FileDetailsDastManualSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastManual extends Component<FileDetailsDastManualSignature> {
  @service('dynamic-scan') declare dsService: DynamicScanService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked lastManualDynamicScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastManualSignature['Args']) {
    super(owner, args);

    // Poll the dynamic scan status if the project org is different from the selected org
    // Only necessary for the case where the file is being accessed by a superuser
    this.dsService.pollDynamicScanStatusForSuperUser({
      file: this.file,
      isAutomatedScan: false,
    });

    this.getLastDynamicScans.perform();
  }

  get file() {
    return this.args.file;
  }

  get profileId() {
    return this.file.profile.get('id') as string;
  }

  get dynamicScan() {
    return this.lastManualDynamicScan;
  }

  get isFetchingDynamicScan() {
    return this.getLastDynamicScans.isRunning;
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

  @action
  reloadLastManualDynamicScan() {
    this.getLastDynamicScans.perform();
  }

  getLastDynamicScans = task(async () => {
    try {
      this.lastManualDynamicScan =
        await this.file.getFileLastManualDynamicScan();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Manual': typeof FileDetailsDastManual;
  }
}
