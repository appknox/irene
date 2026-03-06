import Component from '@glimmer/component';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsComponent extends Component<StoreknoxInventoryDetailsAppDetailsSignature> {
  get showMonitoringPendingInfo() {
    return (
      this.args.skInventoryApp.fakeAppDetectionIsInitializing &&
      this.args.skInventoryApp.monitoringPendingOrDisabled
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails': typeof StoreknoxInventoryDetailsAppDetailsComponent;
  }
}
