import Component from '@glimmer/component';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryDetailsAppDetailsActionsListSignature {
  Args: {
    app?: SkAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListSignature> {
  get actionsList() {
    const skAppId = this.args.app?.id as string;

    return [
      {
        disabled: false,
        label: 'Unscanned Version',
        needsAction: true,
        route: 'authenticated.storeknox.inventory-details.unscanned-version',
        models: [skAppId, '3257'],
      },
      {
        disabled: false,
        label: 'Brand Abuse',
        needsAction: false,
        route: 'authenticated.storeknox.inventory-details.brand-abuse',
        models: [skAppId],
      },
      {
        disabled: false,
        label: 'Malware Detected',
        needsAction: false,
        route: 'authenticated.storeknox.inventory-details.malware-detected',
        models: [skAppId],
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::ActionsList': typeof StoreknoxInventoryDetailsAppDetailsActionsListComponent;
  }
}
