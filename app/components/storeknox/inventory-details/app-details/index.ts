import Component from '@glimmer/component';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsComponent extends Component<StoreknoxInventoryDetailsAppDetailsSignature> {
  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get showMonitoringPendingInfo() {
    return (
      this.skInventoryApp?.fakeAppDetectionIsInitializing &&
      this.skInventoryApp?.storeMonitoringStatusIsPending
    );
  }

  get showMonitoringPendingOrDisabledInfo() {
    return (
      this.showMonitoringPendingInfo ||
      this.skInventoryApp.monitoringIsDisabledWithNoResults
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails': typeof StoreknoxInventoryDetailsAppDetailsComponent;
  }
}
