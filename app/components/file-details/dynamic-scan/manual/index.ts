import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type DynamicScanService from 'irene/services/dynamic-scan';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type EventBusService from 'irene/services/event-bus';

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
  @service declare eventBus: EventBusService;

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

    this.eventBus.on(
      'ws:dynamicscan:update',
      this,
      this.handleDynamicScanUpdate
    );
  }

  get file() {
    return this.args.file;
  }

  get profileId() {
    return this.file.profile.get('id');
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

  @action
  handleDynamicScanUpdate(dynamicscan: DynamicscanModel) {
    if (String(dynamicscan.file.get('id')) === String(this.file.id)) {
      this.getLastDynamicScans.perform();
    }
  }

  getLastDynamicScans = task({ restartable: true }, async () => {
    this.lastManualDynamicScan = await waitForPromise(
      this.file.getFileLastManualDynamicScan()
    );
  });

  willDestroy(): void {
    super.willDestroy();

    this.eventBus.off(
      'ws:dynamicscan:update',
      this,
      this.handleDynamicScanUpdate
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Manual': typeof FileDetailsDastManual;
  }
}
