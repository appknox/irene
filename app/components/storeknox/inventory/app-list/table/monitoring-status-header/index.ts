import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

interface StoreknoxInventoryAppListTableMonitoringStatusHeaderSignature {
  Args: {
    onStatusChange: (status: number) => void;
    selectedMonitoringStatus: number;
  };
}

export default class StoreknoxInventoryAppListTableMonitoringStatusHeaderComponent extends Component<StoreknoxInventoryAppListTableMonitoringStatusHeaderSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedMonitoringStatus: number = -1;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryAppListTableMonitoringStatusHeaderSignature['Args']
  ) {
    super(owner, args);

    this.selectedMonitoringStatus = args.selectedMonitoringStatus;
  }

  get statusOptions() {
    return [
      { key: this.intl.t('all'), value: -1 },
      {
        key: this.intl.t('storeknox.needsAction'),
        value: ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
      },
      {
        key: this.intl.t('storeknox.beingInitialized'),
        value: ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
      },
      {
        key: this.intl.t('disabled'),
        value: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
      },
      {
        key: this.intl.t('storeknox.noActionNeeded'),
        value: ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
      },
    ];
  }

  get filterApplied() {
    return this.selectedMonitoringStatus > -1;
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectStatus(value: number) {
    this.selectedMonitoringStatus = value;
    this.anchorRef = null;

    this.args.onStatusChange(value);
  }

  @action clearFilter() {
    this.selectedMonitoringStatus = -1;
    this.anchorRef = null;

    this.args.onStatusChange(-1);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/app-list/table/monitoring-status-header': typeof StoreknoxInventoryAppListTableMonitoringStatusHeaderComponent;
  }
}
