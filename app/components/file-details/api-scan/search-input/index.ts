import Component from '@glimmer/component';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';

export interface FileDetailsApiScanSearchInputSignature {
  Element: HTMLInputElement;
  Args: {
    onSearch: (query: string) => void;
  };
}

export default class FileDetailsApiScanSearchInputComponent extends Component<FileDetailsApiScanSearchInputSignature> {
  emitSearch(query: string) {
    this.args.onSearch(query.trim());
  }

  @action
  handleSearchInput(event: Event) {
    debounceTask(
      this,
      'emitSearch',
      (event.target as HTMLInputElement).value,
      500
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::SearchInput': typeof FileDetailsApiScanSearchInputComponent;
  }
}
