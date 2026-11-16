import Component from '@glimmer/component';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type { KnoxiqScanStatusByType } from 'irene/components/file-details';

export interface FileDetailsScanActionsStaticScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
    isKnoxiqEnabled?: boolean;
    knoxiqStatuses?: KnoxiqScanStatusByType;
  };
}

export default class FileDetailsScanActionsStaticScanComponent extends Component<FileDetailsScanActionsStaticScanSignature> {
  get sastStatus() {
    return this.args.knoxiqStatuses?.[ENUMS.KNOXIQ_SCAN_TYPE.SAST];
  }

  // Purple KnoxIQ chip regardless of automated vs. manual trigger, but only
  // once KnoxIQ actually has a status to show — a manual-trigger scan that
  // hasn't been run yet is NOT_TRIGGERED, not "running".
  get showKnoxiqStatusChip() {
    const { DISABLED, NOT_TRIGGERED } = ENUMS.KNOXIQ_SCAN_STATUS;

    return Boolean(
      this.args.isKnoxiqEnabled &&
      this.sastStatus !== undefined &&
      this.sastStatus !== DISABLED &&
      this.sastStatus !== NOT_TRIGGERED
    );
  }

  get knoxiqStatusChipState() {
    const { COMPLETED, ERRORED } = ENUMS.KNOXIQ_SCAN_STATUS;

    if (this.sastStatus === COMPLETED) {
      return 'completed';
    }

    if (this.sastStatus === ERRORED) {
      return 'failed';
    }

    return 'running';
  }

  get staticScanAccentClass() {
    if (
      !this.args.isKnoxiqEnabled ||
      !this.args.file.isStaticDone ||
      this.args.file.isKnoxiqAutomated
    ) {
      return '';
    }

    return this.sastStatus === ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED
      ? 'static-scan-accent-done'
      : 'static-scan-accent-pending';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::StaticScan': typeof FileDetailsScanActionsStaticScanComponent;
    'file-details/scan-actions/static-scan': typeof FileDetailsScanActionsStaticScanComponent;
  }
}
