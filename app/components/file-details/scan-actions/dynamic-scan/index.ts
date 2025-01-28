import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import { DsComputedStatus } from 'irene/models/dynamicscan';

export interface FileDetailsScanActionsDynamicScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsDynamicScanComponent extends Component<FileDetailsScanActionsDynamicScanSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  get automatedDynamicScan() {
    return this.args.file.lastAutomatedDynamicScan;
  }

  get manualDynamicScan() {
    return this.args.file.lastManualDynamicScan;
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::DynamicScan': typeof FileDetailsScanActionsDynamicScanComponent;
    'file-details/scan-actions/dynamic-scan': typeof FileDetailsScanActionsDynamicScanComponent;
  }
}
