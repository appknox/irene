import Component from '@glimmer/component';
import { StoreknoxCommonTableColumnsData } from '..';

export interface StoreknoxDiscoverTableColumnsDeveloperSignature {
  Element: HTMLElement;
  Args: {
    data: StoreknoxCommonTableColumnsData;
    loading?: boolean;
  };
}

export default class StoreknoxDiscoverTableColumnsDeveloperComponent extends Component<StoreknoxDiscoverTableColumnsDeveloperSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::Developer': typeof StoreknoxDiscoverTableColumnsDeveloperComponent;
  }
}
