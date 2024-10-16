import Component from '@glimmer/component';

export default class StoreknoxDiscoverTableColumnsComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns': typeof StoreknoxDiscoverTableColumnsComponent;
  }
}
