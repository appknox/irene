import { action } from '@ember/object';
import Component from '@glimmer/component';

import SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

interface StoreknoxDiscoverTableColumnsCheckboxSignature {
  Args: {
    data: SkDiscoverySearchResultModel;
    loading: boolean;
    selectRow: (value: boolean) => void;
  };
}

export default class StoreknoxDiscoverTableColumnsCheckboxComponent extends Component<StoreknoxDiscoverTableColumnsCheckboxSignature> {
  @action handleChange(event: Event) {
    this.args.selectRow((event.target as HTMLInputElement).checked);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::Checkbox': typeof StoreknoxDiscoverTableColumnsCheckboxComponent;
  }
}
