import Component from '@glimmer/component';
import ENUMS from 'irene/enums';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';

export interface DynamicScanStatusChipSignature {
  Args: {
    file: FileModel;
    dynamicScan: DynamicscanModel | null;
    isAutomatedScan?: boolean;
  };
}

export default class DynamicScanStatusChipComponent extends Component<DynamicScanStatusChipSignature> {
  getColor(status: string | number | undefined, isDark: boolean) {
    if (
      this.args.dynamicScan?.isDynamicStatusInProgress &&
      !this.args.dynamicScan?.isRunning
    ) {
      return isDark ? 'warn-dark' : 'warn';
    } else if (status === ENUMS.DYNAMIC_STATUS.COMPLETED) {
      return 'success';
    } else if (status === ENUMS.DYNAMIC_STATUS.NONE) {
      return 'secondary';
    } else if (status === ENUMS.DYNAMIC_STATUS.RUNNING) {
      return isDark ? 'info-dark' : 'info';
    } else {
      return isDark ? 'warn-dark' : 'warn';
    }
  }

  get chipColor() {
    return this.getColor(this.args.dynamicScan?.status, false);
  }

  get loaderColor() {
    return this.getColor(this.args.dynamicScan?.status, true);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::StatusChip': typeof DynamicScanStatusChipComponent;
  }
}
