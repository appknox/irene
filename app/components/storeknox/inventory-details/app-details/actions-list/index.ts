import Component from '@glimmer/component';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryDetailsAppDetailsActionsListSignature {
  Args: {
    app?: SkAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListSignature> {
  get actionsList() {
    return [
      {
        disabled: false,
        label: 'Unscanned Version',
        needsAction: false,
        route: 'authenticated.dashboard.storeknox.inventory.unscanned-version',
        models: ['3257', '3257'],
      },
      {
        disabled: false,
        label: 'Brand Abuse',
        needsAction: false,
        route: 'authenticated.dashboard.storeknox.inventory.brand-abuse',
        models: ['3257'],
      },
      {
        disabled: false,
        label: 'Malware Detected',
        needsAction: false,
        route: 'authenticated.dashboard.storeknox.inventory.malware-detected',
        models: ['3257'],
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::ActionsList': typeof StoreknoxInventoryDetailsAppDetailsActionsListComponent;
  }
}
