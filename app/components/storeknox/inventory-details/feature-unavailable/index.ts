import Component from '@glimmer/component';

interface StoreknoxInventoryDetailsFeatureUnavailableSignature {
  Args: {
    headerTitle: string;
    headerDescription: string;
  };
  Blocks: { illustration: [] };
}

export default class StoreknoxInventoryDetailsFeatureUnavailableComponent extends Component<StoreknoxInventoryDetailsFeatureUnavailableSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::FeatureUnavailable': typeof StoreknoxInventoryDetailsFeatureUnavailableComponent;
  }
}
