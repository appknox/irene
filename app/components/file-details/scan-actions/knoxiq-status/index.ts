import Component from '@glimmer/component';
import type { CopilotScanStatus } from 'irene/adapters/file';

export interface FileDetailsScanActionsKnoxiqStatusSignature {
  Args: {
    copilotStatus: CopilotScanStatus;
  };
}

export default class FileDetailsScanActionsKnoxiqStatusComponent extends Component<FileDetailsScanActionsKnoxiqStatusSignature> {
  get status() {
    return this.args.copilotStatus.status;
  }

  get completedTasks() {
    return this.args.copilotStatus.completed_tasks;
  }

  get totalTasks() {
    return this.args.copilotStatus.total_tasks;
  }

  get isRunning() {
    return this.status === 'running';
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isCompleted() {
    return this.status === 'completed';
  }

  get isFailed() {
    return this.status === 'failed';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::KnoxiqStatus': typeof FileDetailsScanActionsKnoxiqStatusComponent;
    'file-details/scan-actions/knoxiq-status': typeof FileDetailsScanActionsKnoxiqStatusComponent;
  }
}
