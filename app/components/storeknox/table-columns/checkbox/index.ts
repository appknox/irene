import { action } from '@ember/object';
import Component from '@glimmer/component';

import SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

interface StoreknoxDiscoverTableColumnsCheckboxSignature {
  Args: {
    data: SkDiscoverySearchResultModel;
    loading: boolean;
    selectRow: (ulid: string, value: boolean) => void;
  };
}

export default class StoreknoxDiscoverTableColumnsCheckboxComponent extends Component<StoreknoxDiscoverTableColumnsCheckboxSignature> {
  @action handleChange(event: Event) {
    this.args.selectRow(
      this.args.data.docUlid,
      (event.target as HTMLInputElement).checked
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::Checkbox': typeof StoreknoxDiscoverTableColumnsCheckboxComponent;
  }
}
