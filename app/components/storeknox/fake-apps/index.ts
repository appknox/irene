import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class StoreknoxFakeAppsComponent extends Component {
  @tracked searchQuery = '';

  @action
  onSearchQueryChange(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  @action
  clearSearchInput() {
    this.searchQuery = '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps': typeof StoreknoxFakeAppsComponent;
  }
}
