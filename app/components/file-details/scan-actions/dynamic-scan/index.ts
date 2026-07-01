import Component from '@glimmer/component';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import {
  DsStatusGroup,
  getCumulativeDsStatusGroup,
} from 'irene/utils/ds-status-group';
import ENUMS from 'irene/enums';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type { KnoxiqScanStatusByType } from 'irene/components/file-details';

export interface FileDetailsScanActionsDynamicScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
    isKnoxiqEnabled?: boolean;
    knoxiqStatuses?: KnoxiqScanStatusByType;
  };
}

export default class FileDetailsScanActionsDynamicScanComponent extends Component<FileDetailsScanActionsDynamicScanSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked allAutomatedDynamicScans: DynamicscanModel[] = [];
  @tracked allManualDynamicScans: DynamicscanModel[] = [];

  // Specific to the scan actions page as we show a cumulative status for both automated and manual scans
  // The 'inProgress' label is used for the running status as we don't want to show the 'running' label in the scan actions page
  STATUS_GROUP_LABEL: Record<DsStatusGroup, string> = {
    [DsStatusGroup.NOT_STARTED]: 'notStarted',
    [DsStatusGroup.IN_QUEUE]: 'inQueue',
    [DsStatusGroup.STARTING]: 'starting',
    [DsStatusGroup.RUNNING]: 'inProgress',
    [DsStatusGroup.STOPPING]: 'stopping',
    [DsStatusGroup.COMPLETED]: 'completed',
    [DsStatusGroup.ERRORED]: 'errored',
    [DsStatusGroup.CANCELLED]: 'cancelled',
  };

  constructor(
    owner: unknown,
    args: FileDetailsScanActionsDynamicScanSignature['Args']
  ) {
    super(owner, args);

    this.loadLastManualDynamicScans.perform();
    this.loadLastAutoDynamicScans.perform();
  }

  get dastStatus() {
    return (
      this.args.knoxiqStatuses?.[ENUMS.KNOXIQ_SCAN_TYPE.DAST_MANUAL] ??
      this.args.knoxiqStatuses?.[ENUMS.KNOXIQ_SCAN_TYPE.DAST_AUTOMATED]
    );
  }

  get showKnoxiqStatusChip() {
    return Boolean(
      this.args.isKnoxiqEnabled && this.args.file.isKnoxiqAutomated
    );
  }

  get knoxiqStatusChipState() {
    const { COMPLETED, ERRORED } = ENUMS.KNOXIQ_SCAN_STATUS;

    if (this.dastStatus === COMPLETED) {
      return 'completed';
    }

    if (this.dastStatus === ERRORED) {
      return 'failed';
    }

    return 'running';
  }

  get dynamicScanAccentClass() {
    if (
      !this.args.isKnoxiqEnabled ||
      !this.args.file.isDynamicDone ||
      this.args.file.isKnoxiqAutomated
    ) {
      return '';
    }

    return this.dastStatus === ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED
      ? 'dynamic-scan-accent-done'
      : 'dynamic-scan-accent-pending';
  }

  get status() {
    const allScans = [
      ...this.allAutomatedDynamicScans,
      ...this.allManualDynamicScans,
    ];

    return getCumulativeDsStatusGroup(allScans.map((scan) => scan.status));
  }

  get statusLabel() {
    return this.intl.t(this.STATUS_GROUP_LABEL[this.status]);
  }

  get isDynamicScanLoading() {
    return (
      this.loadLastAutoDynamicScans.isRunning ||
      this.loadLastManualDynamicScans.isRunning
    );
  }

  loadLastAutoDynamicScans = task(async () => {
    const scans = await waitForPromise(
      this.args.file.getFileLastAutomatedDynamicScan()
    );

    this.allAutomatedDynamicScans = scans;
  });

  loadLastManualDynamicScans = task(async () => {
    const scans = await waitForPromise(
      this.args.file.getFileLastManualDynamicScan()
    );

    this.allManualDynamicScans = scans;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::DynamicScan': typeof FileDetailsScanActionsDynamicScanComponent;
    'file-details/scan-actions/dynamic-scan': typeof FileDetailsScanActionsDynamicScanComponent;
  }
}
