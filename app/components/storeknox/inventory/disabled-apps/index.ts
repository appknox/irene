import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class StoreknoxInventoryDisabledAppsComponent extends Component {
  @tracked searchQuery = '';

  @action
  discoverApp() {
    this.searchQuery = 'Shell Test';
  }

  @action
  clearSearch() {
    this.searchQuery = '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::DisabledApps': typeof StoreknoxInventoryDisabledAppsComponent;
  }
}
