import Component from '@glimmer/component';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsActionsListButtonSignature {
  Element: HTMLElement;
  Args: {
    skInventoryApp?: SkInventoryAppModel;
    needsAction?: boolean;
    featureInProgress?: boolean;
    disabled?: boolean;
    label: string;
    hideRightIcon?: boolean;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListButtonComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListButtonSignature> {
  get isArchived() {
    return this.args.skInventoryApp?.isArchived;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::ActionsList::Button': typeof StoreknoxInventoryDetailsAppDetailsActionsListButtonComponent;
  }
}
