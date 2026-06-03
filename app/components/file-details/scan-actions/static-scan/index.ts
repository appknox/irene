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

  get showKnoxiqStatusChip() {
    return Boolean(
      this.args.isKnoxiqEnabled && this.args.file.isKnoxiqAutomated
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
