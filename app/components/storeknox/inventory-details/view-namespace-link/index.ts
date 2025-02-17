import Component from '@glimmer/component';

interface StoreknoxInventoryDetailsViewNamespaceLinkSignature {
  Element: HTMLElement;
}

export default class StoreknoxInventoryDetailsViewNamespaceLinkComponent extends Component<StoreknoxInventoryDetailsViewNamespaceLinkSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::ViewNamespaceLink': typeof StoreknoxInventoryDetailsViewNamespaceLinkComponent;
  }
}
