import Component from '@glimmer/component';

interface StoreknoxInventoryDetailsUnscannedVersionTableLoadingSignature {
  Element: HTMLElement;
  Args: {
    loadingText?: string;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionTableLoadingComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionTableLoadingSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::UnscannedVersion::TableLoading': typeof StoreknoxInventoryDetailsUnscannedVersionTableLoadingComponent;
  }
}
