import { action } from '@ember/object';
import Component from '@glimmer/component';

interface StoreknoxDiscoverTableColumnsCheckboxHeaderSignature {
  Args: {
    loading: boolean;
    selected: boolean;
    selectAllRow: (value: boolean) => void;
  };
}

export default class StoreknoxDiscoverTableColumnsCheckboxHeaderComponent extends Component<StoreknoxDiscoverTableColumnsCheckboxHeaderSignature> {
  @action handleChange(event: Event) {
    this.args.selectAllRow((event.target as HTMLInputElement).checked);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::CheckboxHeader': typeof StoreknoxDiscoverTableColumnsCheckboxHeaderComponent;
  }
}
