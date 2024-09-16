import Component from '@glimmer/component';

export default class StoreknoxDiscoverResultsEmptyComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Empty': typeof StoreknoxDiscoverResultsEmptyComponent;
  }
}
