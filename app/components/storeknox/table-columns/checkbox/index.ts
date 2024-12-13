import { action } from '@ember/object';
import Component from '@glimmer/component';

import type SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

interface StoreknoxDiscoverTableColumnsCheckboxSignature {
  Args: {
    data: SkDiscoverySearchResultModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverTableColumnsCheckboxComponent extends Component<StoreknoxDiscoverTableColumnsCheckboxSignature> {
  @action handleChange() {
    // Will require when multiple is in scope
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::Checkbox': typeof StoreknoxDiscoverTableColumnsCheckboxComponent;
  }
}
