import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import DynamicscanModel, { DsComputedStatus } from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type LoggerService from 'irene/services/logger';

export interface FileDetailsScanActionsDynamicScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
  };
}

export default class FileDetailsScanActionsDynamicScanComponent extends Component<FileDetailsScanActionsDynamicScanSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare logger: LoggerService;

  @tracked automatedDynamicScan: DynamicscanModel | null = null;
  @tracked manualDynamicScan: DynamicscanModel | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsScanActionsDynamicScanSignature['Args']
  ) {
    super(owner, args);

    this.loadLastManualDynamicScans.perform();
    this.loadLastAutoDynamicScans.perform();
  }

  get status() {
    const automatedStatus = this.automatedDynamicScan?.get('computedStatus');
    const manualStatus = this.manualDynamicScan?.get('computedStatus');

    if (automatedStatus && manualStatus) {
      return this.computeStatus(automatedStatus, manualStatus);
    }

    const singleStatus = automatedStatus || manualStatus;

    if (singleStatus === DsComputedStatus.RUNNING) {
      return DsComputedStatus.IN_PROGRESS;
    }

    return singleStatus || DsComputedStatus.NOT_STARTED;
  }

  get isDynamicScanLoading() {
    return (
      this.loadLastAutoDynamicScans.isRunning ||
      this.loadLastManualDynamicScans.isRunning
    );
  }

  @action
  computeStatus(s1: DsComputedStatus, s2: DsComputedStatus) {
    // If both scan has error, return error
    if (s1 === DsComputedStatus.ERROR && s2 === DsComputedStatus.ERROR) {
      return DsComputedStatus.ERROR;
    }

    // If either scan is in progress, return in progress
    if (
      s1 === DsComputedStatus.IN_PROGRESS ||
      s2 === DsComputedStatus.IN_PROGRESS ||
      s1 === DsComputedStatus.RUNNING ||
      s2 === DsComputedStatus.RUNNING
    ) {
      return DsComputedStatus.IN_PROGRESS;
    }

    // If either scans are completed, return completed
    if (
      s1 === DsComputedStatus.COMPLETED ||
      s2 === DsComputedStatus.COMPLETED
    ) {
      return DsComputedStatus.COMPLETED;
    }

    // If either scans are cancelled, return cancelled
    if (
      s1 === DsComputedStatus.CANCELLED ||
      s2 === DsComputedStatus.CANCELLED
    ) {
      return DsComputedStatus.CANCELLED;
    }

    return DsComputedStatus.NOT_STARTED;
  }

  loadLastAutoDynamicScans = task(async () => {
    this.automatedDynamicScan = await waitForPromise(
      this.args.file.getFileLastAutomatedDynamicScan()
    );
  });

  loadLastManualDynamicScans = task(async () => {
    this.manualDynamicScan = await waitForPromise(
      this.args.file.getFileLastManualDynamicScan()
    );
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::DynamicScan': typeof FileDetailsScanActionsDynamicScanComponent;
    'file-details/scan-actions/dynamic-scan': typeof FileDetailsScanActionsDynamicScanComponent;
  }
}
