import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { DsComputedStatus } from 'irene/models/dynamicscan';
import { type AkLoaderColor } from 'irene/components/ak-loader';
import { type AkChipColor } from 'irene/components/ak-chip';

export interface DynamicScanStatusChipSignature {
  Element: HTMLElement;
  Args: {
    status: DsComputedStatus | undefined;
    statusText?: string;
  };
}

export default class DynamicScanStatusChipComponent extends Component<DynamicScanStatusChipSignature> {
  @service declare intl: IntlService;

  get status() {
    return this.args.status;
  }

  get statusText() {
    return this.args.statusText;
  }

  get chipColor() {
    return this.getColor(this.status, false) as AkChipColor;
  }

  get loaderColor() {
    return this.getColor(this.status, true) as AkLoaderColor;
  }

  get chipDetails() {
    if (this.status === DsComputedStatus.ERROR) {
      return {
        label: this.intl.t('errored'),
        color: 'error' as const,
        icon: 'warning',
      };
    } else if (this.status === DsComputedStatus.IN_PROGRESS) {
      return {
        label: this.statusText || this.intl.t('inProgress'),
        color: this.chipColor,
        loaderColor: this.loaderColor,
      };
    } else if (this.status === DsComputedStatus.RUNNING) {
      return {
        label: this.statusText || this.intl.t('running'),
        color: this.chipColor,
        loaderColor: this.loaderColor,
      };
    } else if (this.status === DsComputedStatus.COMPLETED) {
      return {
        label: this.intl.t('completed'),
        color: 'success' as const,
      };
    } else if (this.status === DsComputedStatus.CANCELLED) {
      return {
        label: this.intl.t('cancelled'),
        color: 'secondary' as const,
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
    if (status === DsComputedStatus.IN_PROGRESS) {
      return isLoader ? 'warn-dark' : 'warn';
    } else if (status === DsComputedStatus.COMPLETED) {
      return 'success';
    } else if (status === DsComputedStatus.NOT_STARTED) {
      return 'secondary';
    } else if (status === DsComputedStatus.RUNNING) {
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
