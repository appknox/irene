import Component from '@glimmer/component';

export default class StoreknoxInventoryDetailsAppDetailsVaResultsFileInaccessibleComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults::FileInaccessible': typeof StoreknoxInventoryDetailsAppDetailsVaResultsFileInaccessibleComponent;
  }
}
