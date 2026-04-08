import Component from '@glimmer/component';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsMonitoringPendingOrDisabledUiSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsMonitoringPendingOrDisabledUiComponent extends Component<StoreknoxInventoryDetailsAppDetailsMonitoringPendingOrDisabledUiSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::MonitoringPendingOrDisabledUi': typeof StoreknoxInventoryDetailsAppDetailsMonitoringPendingOrDisabledUiComponent;
  }
}
