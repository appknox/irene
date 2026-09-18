import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import {
  DsStatusGroup,
  DS_STATUS_GROUP_LABEL,
} from 'irene/utils/ds-status-group';

import { type AkLoaderColor } from 'irene/components/ak-loader';
import { type AkChipColor } from 'irene/components/ak-chip';

export interface DynamicScanStatusChipSignature {
  Element: HTMLElement;
  Args: {
    status: DsStatusGroup | undefined;
    statusText?: string;
    runningAsWarn?: boolean;
  };
}

export default class DynamicScanStatusChipComponent extends Component<DynamicScanStatusChipSignature> {
  @service declare intl: IntlService;

  LOADING_STATUS_GROUPS = [
    DsStatusGroup.IN_QUEUE,
    DsStatusGroup.STARTING,
    DsStatusGroup.RETRYING,
    DsStatusGroup.RUNNING,
    DsStatusGroup.STOPPING,
  ];

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

  get isLoadingStatus() {
    return this.status && this.LOADING_STATUS_GROUPS.includes(this.status);
  }

  get defaultLabel() {
    if (this.status === undefined) {
      return this.intl.t('notStarted');
    }

    return this.intl.t(DS_STATUS_GROUP_LABEL[this.status]);
  }

  get chipDetails() {
    if (this.status === DsStatusGroup.ERRORED) {
      return {
        label: this.intl.t('errored'),
        color: 'error' as const,
        icon: 'warning' as const,
      };
    } else if (this.isLoadingStatus) {
      return {
        label: this.statusText || this.defaultLabel,
        color: this.chipColor,
        loaderColor: this.loaderColor,
      };
    } else if (this.status === DsStatusGroup.COMPLETED) {
      return {
        label: this.intl.t('completed'),
        color: 'success' as const,
      };
    } else if (this.status === DsStatusGroup.CANCELLED) {
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
    status: DsStatusGroup | undefined,
    isLoader: boolean
  ): AkChipColor | AkLoaderColor {
    if (status === DsStatusGroup.RUNNING && !this.args.runningAsWarn) {
      return isLoader ? 'info-dark' : 'info';
    } else if (status === DsStatusGroup.COMPLETED) {
      return 'success';
    } else if (status === DsStatusGroup.NOT_STARTED) {
      return 'secondary';
    } else {
      // IN_QUEUE, STARTING, STOPPING, ERRORED and CANCELLED all use warn.
      return isLoader ? 'warn-dark' : 'warn';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::StatusChip': typeof DynamicScanStatusChipComponent;
  }
}
