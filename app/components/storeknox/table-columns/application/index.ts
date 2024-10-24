import Component from '@glimmer/component';
import { StoreknoxCommonTableColumnsData } from '..';

export interface StoreknoxDiscoverTableColumnsApplicationSignature {
  Element: HTMLElement;
  Args: {
    data: StoreknoxCommonTableColumnsData;
    loading?: boolean;
  };
}

export default class StoreknoxDiscoverTableColumnsApplicationComponent extends Component<StoreknoxDiscoverTableColumnsApplicationSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::Application': typeof StoreknoxDiscoverTableColumnsApplicationComponent;
  }
}
