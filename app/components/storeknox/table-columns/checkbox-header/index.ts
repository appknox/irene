import { action } from '@ember/object';
import Component from '@glimmer/component';

interface StoreknoxDiscoverTableColumnsCheckboxHeaderSignature {
  Args: {
    loading: boolean;
    selected: boolean;
  };
}

export default class StoreknoxDiscoverTableColumnsCheckboxHeaderComponent extends Component<StoreknoxDiscoverTableColumnsCheckboxHeaderSignature> {
  @action handleChange() {
    // Will require when multiple is in scope
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::CheckboxHeader': typeof StoreknoxDiscoverTableColumnsCheckboxHeaderComponent;
  }
}
