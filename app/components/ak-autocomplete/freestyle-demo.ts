import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const STRING_OPTIONS = ['username', 'password', 'email', 'phone', 'phone2', 'username2'];

interface AkAutocompleteFreestyleDemoSignature {
  Args: {
    loading?: boolean;
  };
}

export default class AkAutocompleteFreestyleDemoComponent extends Component<AkAutocompleteFreestyleDemoSignature> {
  options = STRING_OPTIONS;
  @tracked searchQuery = '';

  get loadingOptions() {
    return this.args.loading ?? false;
  }

  @action
  handleChange(searchValue: string, _event: Event | null) {
    this.searchQuery = searchValue;
  }
}
