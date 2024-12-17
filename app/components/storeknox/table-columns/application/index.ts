import Component from '@glimmer/component';
import { action } from '@ember/object';
import type { StoreknoxCommonTableColumnsData } from '..';

export interface StoreknoxDiscoverTableColumnsApplicationSignature {
  Element: HTMLElement;
  Args: {
    data: StoreknoxCommonTableColumnsData;
    loading?: boolean;
  };
}

export default class StoreknoxDiscoverTableColumnsApplicationComponent extends Component<StoreknoxDiscoverTableColumnsApplicationSignature> {
  @action openAppLinkInNewTab(ev: Event) {
    ev.stopPropagation();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::Application': typeof StoreknoxDiscoverTableColumnsApplicationComponent;
  }
}
