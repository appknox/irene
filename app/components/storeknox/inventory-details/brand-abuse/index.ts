import Component from '@glimmer/component';

export default class StoreknoxInventoryDetailsBrandAbuseComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::BrandAbuse': typeof StoreknoxInventoryDetailsBrandAbuseComponent;
  }
}
