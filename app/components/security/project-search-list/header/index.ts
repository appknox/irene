import Component from '@glimmer/component';
import { action } from '@ember/object';

export interface SecurityProjectSearchHeaderComponentSignature {
  Args: {
    packageNameSearchQuery: string;
    onQueryChange(event: Event): void;
    handleClear(): void;
  };
}

export default class SecurityProjectSearchListHeaderComponent extends Component<SecurityProjectSearchHeaderComponentSignature> {
  @action
  clearSearchInput() {
    this.args.handleClear();
  }

  @action onSearchQueryChange(event: Event) {
    this.args.onQueryChange(event);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ProjectSearchList::Header': typeof SecurityProjectSearchListHeaderComponent;
  }
}
