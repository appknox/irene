import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { type StoreknoxInventoryAppListQueryParams } from 'irene/routes/authenticated/storeknox/inventory/app-list';

export interface StoreknoxInventoryAppListSignature {
  Args: {
    queryParams: StoreknoxInventoryAppListQueryParams;
  };
}

export default class StoreknoxInventoryAppListComponent extends Component<StoreknoxInventoryAppListSignature> {
  @tracked searchQuery = '';
  @tracked discoverClicked = false;

  @action
  discoverApp() {
    this.searchQuery = 'Shell Test';
    this.discoverClicked = true;
  }

  @action
  clearSearch() {
    this.searchQuery = '';
    this.discoverClicked = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::AppList': typeof StoreknoxInventoryAppListComponent;
  }
}
