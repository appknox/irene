import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxInventoryAppListTableMonitoringStatusSignature {
  Element: HTMLElement;
  Args: {
    app?: SkInventoryAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryAppListTableMonitoringStatusComponent extends Component<StoreknoxInventoryAppListTableMonitoringStatusSignature> {
  @service declare intl: IntlService;

  get needsAction() {
    return (
      this.args.app?.storeMonitoringStatus ===
      ENUMS.SK_APP_MONITORING_STATUS.UNSCANNED
    );
  }

  get appIsDisabled() {
    return this.args.app?.appStatus === ENUMS.SK_APP_STATUS.INACTIVE;
  }

  get tooltipMessage() {
    if (this.needsAction) {
      return this.intl.t('storeknox.actionsNeededMsg');
    }

    return this.intl.t('storeknox.noActionsNeededMsg');
  }

  get monitoringStatusIconDetails() {
    if (this.appIsDisabled) {
      return { name: 'do-not-disturb-on', color: 'textSecondary' as const };
    }

    if (this.needsAction) {
      return { name: 'info', color: 'error' as const };
    }

    return { name: 'check-circle', color: 'success' as const };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/app-list/table/monitoring-status': typeof StoreknoxInventoryAppListTableMonitoringStatusComponent;
  }
}
