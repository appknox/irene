import Component from '@glimmer/component';

interface StoreknoxInventoryDetailsUnscannedVersionTableEmptySignature {
  Element: HTMLElement;
  Args: {
    header?: string;
    body?: string;
    isHistoryTable?: boolean;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionTableEmptyComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionTableEmptySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::UnscannedVersion::TableEmpty': typeof StoreknoxInventoryDetailsUnscannedVersionTableEmptyComponent;
  }
}
