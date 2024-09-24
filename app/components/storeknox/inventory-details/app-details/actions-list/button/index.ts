import Component from '@glimmer/component';
import { ButtonTags } from 'irene/components/ak-button';

interface StoreknoxInventoryDetailsAppDetailsActionsListButtonSignature {
  Element: HTMLElementTagNameMap[ButtonTags];
  Args: {
    needsAction: boolean;
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
