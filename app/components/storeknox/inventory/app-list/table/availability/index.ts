import Component from '@glimmer/component';
import ENUMS from 'irene/enums';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxInventoryAppListTableAvailabilitySignature {
  Element: HTMLElement;
  Args: {
    app: SkInventoryAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryAppListTableAvailabilityComponent extends Component<StoreknoxInventoryAppListTableAvailabilitySignature> {
  get skApp() {
    return this.args.app;
  }

  get appIsOnAppknoxOnly() {
    return this.skApp?.availability?.appknox;
  }

  get appIsOnStoreknoxOnly() {
    return this.skApp?.availability?.storeknox;
  }

  get appIsDisabled() {
    return this.skApp?.appStatus === ENUMS.SK_APP_STATUS.INACTIVE;
  }

  get svgComponent() {
    if (
      this.appIsDisabled &&
      this.appIsOnAppknoxOnly &&
      !this.appIsOnStoreknoxOnly
    ) {
      return 'ak-svg/disabled-vapt-indicator';
    }

    if (this.appIsOnAppknoxOnly) {
      return 'ak-svg/vapt-indicator';
    }

    if (this.appIsOnStoreknoxOnly) {
      return 'ak-svg/sm-indicator';
    }

    if (this.appIsDisabled) {
      return 'ak-svg/info-indicator';
    }

    return 'ak-svg/vapt-indicator';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/app-list/table/availability': typeof StoreknoxInventoryAppListTableAvailabilityComponent;
  }
}
