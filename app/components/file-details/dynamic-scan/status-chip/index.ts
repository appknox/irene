import Component from '@glimmer/component';
import ENUMS from 'irene/enums';
import DynamicscanModel from 'irene/models/dynamicscan';
import FileModel from 'irene/models/file';

export interface DynamicScanStatusChipSignature {
  Args: {
    file: FileModel;
    dynamicScan: DynamicscanModel | null;
    isAutomatedScan?: boolean;
  };
}

export default class DynamicScanStatusChipComponent extends Component<DynamicScanStatusChipSignature> {
  get chipColor() {
    const dynamicScanStatus = this.args.dynamicScan?.status;

    if (
      this.args.dynamicScan?.isDynamicStatusInProgress &&
      !this.args.dynamicScan?.isRunning
    ) {
      return 'warn';
    } else if (dynamicScanStatus === ENUMS.DYNAMIC_STATUS.COMPLETED) {
      return 'success';
    } else if (dynamicScanStatus === ENUMS.DYNAMIC_STATUS.NONE) {
      return 'secondary';
    } else if (dynamicScanStatus === ENUMS.DYNAMIC_STATUS.RUNNING) {
      return 'info';
    } else {
      return 'warn';
    }
  }

  get loaderColor() {
    const dynamicScanStatus = this.args.dynamicScan?.status;

    if (
      this.args.dynamicScan?.isDynamicStatusInProgress &&
      !this.args.dynamicScan?.isRunning
    ) {
      return 'warn-dark';
    } else if (dynamicScanStatus === ENUMS.DYNAMIC_STATUS.COMPLETED) {
      return 'success';
    } else if (dynamicScanStatus === ENUMS.DYNAMIC_STATUS.NONE) {
      return 'secondary';
    } else if (dynamicScanStatus === ENUMS.DYNAMIC_STATUS.RUNNING) {
      return 'info-dark';
    } else {
      return 'warn-dark';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::StatusChip': typeof DynamicScanStatusChipComponent;
  }
}
