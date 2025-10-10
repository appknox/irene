import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type SkAppModel from 'irene/models/sk-app';

export interface StoreknoxInventoryAppListTableMonitoringStatusSignature {
  Element: HTMLElement;
  Args: {
    app?: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryAppListTableMonitoringStatusComponent extends Component<StoreknoxInventoryAppListTableMonitoringStatusSignature> {
  @service declare intl: IntlService;

  get app() {
    return this.args.app;
  }

  get disableTooltip() {
    return this.args.loading;
  }

  get tooltipMessage() {
    if (this.app?.needsAction) {
      return this.intl.t('storeknox.actionsNeededMsg', {
        htmlSafe: true,
      });
    }

    if (this.app?.appIsInInitializingState) {
      return this.intl.t('storeknox.initializingMsg');
    }

    if (this.app?.appIsInDisabledState) {
      return this.intl.t('storeknox.disabledMsg');
    }

    return this.intl.t('storeknox.noActionsNeededMsg', {
      htmlSafe: true,
    });
  }

  get tooltipSuffix() {
    if (this.app?.appIsInInitializingState || this.app?.appIsInDisabledState) {
      return '';
    }

    return this.intl.t('storeknox.haveBeenDetected');
  }

  get iconDetails() {
    if (this.app?.needsAction) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/action-needed' as const,
        key: 'action-needed',
      };
    }

    if (this.app?.appIsInInitializingState) {
      return {
        icon: 'ak-svg/sox-monitoring-stats-icons/initializing' as const,
        key: 'initializing',
      };
    }

    if (this.app?.appIsInDisabledState) {
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
    if (this.app?.needsAction) {
      return this.intl.t('storeknox.needsAction');
    }

    if (this.app?.appIsInInitializingState) {
      return this.intl.t('storeknox.beingInitialized');
    }

    if (this.app?.appIsInDisabledState) {
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
