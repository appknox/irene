import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';
import { DsComputedStatus } from 'irene/models/dynamicscan';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsScanActionsDynamicScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsDynamicScanComponent extends Component<FileDetailsScanActionsDynamicScanSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked automatedDynamicScan: DynamicscanModel | null = null;
  @tracked manualDynamicScan: DynamicscanModel | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsScanActionsDynamicScanSignature['Args']
  ) {
    super(owner, args);

    this.fetchLatestManualAutomaticScan.perform();
  }

  get status() {
    const automatedStatus = this.automatedDynamicScan?.computedStatus;
    const manualStatus = this.manualDynamicScan?.computedStatus;

    if (automatedStatus && manualStatus) {
      return this.computeStatus(automatedStatus, manualStatus);
    }

    const singleStatus = automatedStatus || manualStatus;

    if (singleStatus === DsComputedStatus.RUNNING) {
      return DsComputedStatus.IN_PROGRESS;
    }

    return singleStatus || DsComputedStatus.NOT_STARTED;
  }

  @action
  computeStatus(s1: DsComputedStatus, s2: DsComputedStatus) {
    // If either scan has error, return error
    if (s1 === DsComputedStatus.ERROR || s2 === DsComputedStatus.ERROR) {
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

    // If both scans are completed, return completed
    if (
      s1 === DsComputedStatus.COMPLETED &&
      s2 === DsComputedStatus.COMPLETED
    ) {
      return DsComputedStatus.COMPLETED;
    }

    return DsComputedStatus.NOT_STARTED;
  }

  fetchLatestManualAutomaticScan = task(async () => {
    try {
      const file = this.args.file;

      this.automatedDynamicScan = await waitForPromise(
        file.getLastDynamicScan(file.id, ENUMS.DYNAMIC_MODE.AUTOMATED)
      );

      this.manualDynamicScan = await waitForPromise(
        file.getLastDynamicScan(file.id, ENUMS.DYNAMIC_MODE.MANUAL)
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::DynamicScan': typeof FileDetailsScanActionsDynamicScanComponent;
    'file-details/scan-actions/dynamic-scan': typeof FileDetailsScanActionsDynamicScanComponent;
  }
}
