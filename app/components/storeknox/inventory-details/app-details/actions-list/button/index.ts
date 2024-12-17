import Component from '@glimmer/component';

interface StoreknoxInventoryDetailsAppDetailsActionsListButtonSignature {
  Element: HTMLElement;
  Args: {
    needsAction?: boolean;
    featureInProgress?: boolean;
    disabled?: boolean;
    label: string;
    hideRightIcon?: boolean;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListButtonComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListButtonSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::ActionsList::Button': typeof StoreknoxInventoryDetailsAppDetailsActionsListButtonComponent;
  }
}
