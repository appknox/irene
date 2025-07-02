import Component from '@glimmer/component';

interface StoreknoxInventoryAppListTableEmptySignature {
  Args: {
    subText?: string;
  };
}

export default class StoreknoxInventoryAppListTableEmptyComponent extends Component<StoreknoxInventoryAppListTableEmptySignature> {}
declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::AppList::Table::Empty': typeof StoreknoxInventoryAppListTableEmptyComponent;
  }
}
