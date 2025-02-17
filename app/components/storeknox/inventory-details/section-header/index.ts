import Component from '@glimmer/component';

interface StoreknoxInventoryDetailsSectionHeaderSignature {
  Element: HTMLElement;
  Args: {
    color?: 'default' | 'white';
  };
  Blocks: {
    icon?: [];
    default: [];
  };
}

export default class StoreknoxInventoryDetailsSectionHeaderComponent extends Component<StoreknoxInventoryDetailsSectionHeaderSignature> {
  get color() {
    return this.args.color || 'default';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::SectionHeader': typeof StoreknoxInventoryDetailsSectionHeaderComponent;
  }
}
