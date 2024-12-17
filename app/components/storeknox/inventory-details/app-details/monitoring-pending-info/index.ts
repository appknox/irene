import Component from '@glimmer/component';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsMonitoringPendingInfoSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsMonitoringPendingInfoComponent extends Component<StoreknoxInventoryDetailsAppDetailsMonitoringPendingInfoSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::MonitoringPendingInfo': typeof StoreknoxInventoryDetailsAppDetailsMonitoringPendingInfoComponent;
  }
}
