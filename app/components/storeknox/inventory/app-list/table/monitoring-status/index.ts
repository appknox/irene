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

  get app() {
    return this.args.app;
  }

  get needsAction() {
    return (
      this.app?.storeMonitoringStatus ===
      ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED
    );
  }

  get noActionNeeded() {
    return (
      this.app?.storeMonitoringStatus ===
      ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED
    );
  }

  get appIsDisabled() {
    return (
      !this.app?.monitoringEnabled && !this.needsAction && !this.noActionNeeded
    );
  }

  get appIsInitializing() {
    return this.app?.monitoringEnabled && this.app?.monitoringStatusIsPending;
  }

  get disableTooltip() {
    return this.args.loading;
  }

  get tooltipMessage() {
    if (this.needsAction) {
      return this.intl.t('storeknox.actionsNeededMsg', {
        htmlSafe: true,
      });
    }

    if (this.appIsInitializing) {
      return this.intl.t('storeknox.initializingMsg');
    }

    if (this.appIsDisabled) {
      return this.intl.t('storeknox.disabledMsg');
    }

    return this.intl.t('storeknox.noActionsNeededMsg', {
      htmlSafe: true,
    });
  }

  get tooltipSuffix() {
    if (this.appIsInitializing || this.appIsDisabled) {
      return '';
    }

    return this.intl.t('storeknox.haveBeenDetected');
  }

  get iconDetails() {
    if (this.needsAction) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/action-needed' as const,
        key: 'action-needed',
      };
    }

    if (this.appIsInitializing) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/initializing' as const,
        key: 'initializing',
      };
    }

    if (this.appIsDisabled) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/disabled' as const,
        key: 'disabled',
      };
    }

    return {
      icon: 'ak-svg/sox-monitoring-stats-icons/no-action-needed' as const,
      key: 'no-action-needed',
    };
  }

  get statusText() {
    if (this.needsAction) {
      return this.intl.t('storeknox.needsAction');
    }

    if (this.appIsInitializing) {
      return this.intl.t('storeknox.beingInitialized');
    }

    if (this.appIsDisabled) {
      return this.intl.t('disabled');
    }

    return this.intl.t('storeknox.noActionNeeded');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/app-list/table/monitoring-status': typeof StoreknoxInventoryAppListTableMonitoringStatusComponent;
  }
}
