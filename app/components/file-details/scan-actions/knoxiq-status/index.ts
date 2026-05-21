import Component from '@glimmer/component';
import { KNOXIQ_SCAN_STATUS, type KnoxIQScanStatusEntry } from 'irene/adapters/file';

export interface FileDetailsScanActionsKnoxiqStatusSignature {
  Args: {
    copilotStatus: KnoxIQScanStatusEntry;
  };
}

export default class FileDetailsScanActionsKnoxiqStatusComponent extends Component<FileDetailsScanActionsKnoxiqStatusSignature> {
  get status() {
    return this.args.copilotStatus.status;
  }

  get isRunning() {
    return this.status === KNOXIQ_SCAN_STATUS.RUNNING;
  }

  get isPending() {
    return this.status === KNOXIQ_SCAN_STATUS.PENDING;
  }

  get isCompleted() {
    return this.status === KNOXIQ_SCAN_STATUS.COMPLETED;
  }

  get isFailed() {
    return this.status === KNOXIQ_SCAN_STATUS.ERRORED;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::KnoxiqStatus': typeof FileDetailsScanActionsKnoxiqStatusComponent;
    'file-details/scan-actions/knoxiq-status': typeof FileDetailsScanActionsKnoxiqStatusComponent;
  }
}
