import Component from '@glimmer/component';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type { KnoxiqScanStatusByType } from 'irene/components/file-details';

export interface FileDetailsScanActionsApiScanSignature {
  Args: {
    file: FileModel;
    vulnerabilityCount: number | null;
    isKnoxiqEnabled?: boolean;
    knoxiqStatuses?: KnoxiqScanStatusByType;
  };
}

export default class FileDetailsScanActionsApiScanComponent extends Component<FileDetailsScanActionsApiScanSignature> {
  get apiStatus() {
    return this.args.knoxiqStatuses?.[ENUMS.KNOXIQ_SCAN_TYPE.API];
  }

  get showKnoxiqStatusChip() {
    const { DISABLED, NOT_TRIGGERED, API_SCAN_DISABLED } =
      ENUMS.KNOXIQ_SCAN_STATUS;

    return Boolean(
      this.args.isKnoxiqEnabled &&
      this.apiStatus !== undefined &&
      this.apiStatus !== DISABLED &&
      this.apiStatus !== NOT_TRIGGERED &&
      this.apiStatus !== API_SCAN_DISABLED
    );
  }

  get knoxiqStatusChipState() {
    const { COMPLETED, ERRORED } = ENUMS.KNOXIQ_SCAN_STATUS;

    if (this.apiStatus === COMPLETED) {
      return 'completed';
    }

    if (this.apiStatus === ERRORED) {
      return 'failed';
    }

    return 'running';
  }

  get apiScanAccentClass() {
    if (
      !this.args.isKnoxiqEnabled ||
      !this.args.file.isApiDone ||
      this.args.file.isKnoxiqAutomated
    ) {
      return '';
    }

    return this.apiStatus === ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED
      ? 'api-scan-accent-done'
      : 'api-scan-accent-pending';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ApiScan': typeof FileDetailsScanActionsApiScanComponent;
    'file-details/scan-actions/api-scan': typeof FileDetailsScanActionsApiScanComponent;
  }
}
