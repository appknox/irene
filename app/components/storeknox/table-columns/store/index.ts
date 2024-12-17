import Component from '@glimmer/component';
import { StoreknoxCommonTableColumnsData } from '..';

export interface StoreknoxDiscoverTableColumnsStoreSignature {
  Element: HTMLElement;
  Args: {
    data: StoreknoxCommonTableColumnsData;
    loading?: boolean;
  };
}

export default class StoreknoxDiscoverTableColumnsStoreComponent extends Component<StoreknoxDiscoverTableColumnsStoreSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::Store': typeof StoreknoxDiscoverTableColumnsStoreComponent;
  }
}
