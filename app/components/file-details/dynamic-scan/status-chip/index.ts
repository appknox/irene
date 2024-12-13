import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ENUMS from 'irene/enums';
import type IntlService from 'ember-intl/services/intl';

import { type AkLoaderColor } from 'irene/components/ak-loader';
import { type AkChipColor } from 'irene/components/ak-chip';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';

export interface DynamicScanStatusChipSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    dynamicScan?: DynamicscanModel | null;
    uppercase?: boolean;
    chipStatusText?: string;
    isAutomatedScan?: boolean;
  };
}

export default class DynamicScanStatusChipComponent extends Component<DynamicScanStatusChipSignature> {
  @service declare intl: IntlService;

  get dynamicScan() {
    return this.args.dynamicScan;
  }

  get chipColor() {
    return this.getColor(this.dynamicScan?.status, false) as AkChipColor;
  }

  get loaderColor() {
    return this.getColor(this.dynamicScan?.status, true) as AkLoaderColor;
  }

  get chipDetails() {
    if (this.dynamicScan?.isStatusError) {
      return {
        label: this.intl.t('errored'),
        color: 'error' as const,
        icon: 'warning',
      };
    } else if (this.dynamicScan?.isDynamicStatusInProgress) {
      return {
        label: this.dynamicScan.statusText,
        color: this.chipColor,
        loaderColor: this.loaderColor,
      };
    } else if (this.dynamicScan?.isCompleted) {
      return {
        label: this.intl.t('completed'),
        color: 'success' as const,
      };
    }

    return {
      label: this.intl.t('notStarted'),
      color: 'secondary' as const,
    };
  }

  @action
  getColor(
    status: string | number | undefined,
    isLoader: boolean
  ): AkChipColor | AkLoaderColor {
    if (
      this.dynamicScan?.isDynamicStatusInProgress &&
      this.dynamicScan.isRunning
    ) {
      return isLoader ? 'warn-dark' : 'warn';
    } else if (status === ENUMS.DYNAMIC_STATUS.COMPLETED) {
      return 'success';
    } else if (status === ENUMS.DYNAMIC_STATUS.NONE) {
      return 'secondary';
    } else if (status === ENUMS.DYNAMIC_STATUS.RUNNING) {
      return isLoader ? 'info-dark' : 'info';
    } else {
      return isLoader ? 'warn-dark' : 'warn';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::StatusChip': typeof DynamicScanStatusChipComponent;
  }
}
