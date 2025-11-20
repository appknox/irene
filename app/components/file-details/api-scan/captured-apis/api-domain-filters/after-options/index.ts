import Component from '@glimmer/component';
import { action } from '@ember/object';
import type { FileDetailsApiScanCapturedApisApiDomainFiltersExtra } from '..';

export interface FileDetailsApiScanCapturedApisApiDomainFiltersAfterOptionsSignature {
  Args: {
    extra?: FileDetailsApiScanCapturedApisApiDomainFiltersExtra;
  };
}

export default class FileDetailsApiScanCapturedApisApiDomainFiltersAfterOptionsComponent extends Component<FileDetailsApiScanCapturedApisApiDomainFiltersAfterOptionsSignature> {
  get hasSelectedItems() {
    const selectedItem = this.args.extra?.selectedItem;

    return selectedItem && selectedItem.length > 0;
  }

  @action
  handleClearAll() {
    this.args.extra?.onClearAll();
  }

  @action
  handleApplyFilters() {
    this.args.extra?.onApplyFilters();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/api-scan/captured-apis/api-domain-filters/after-options': typeof FileDetailsApiScanCapturedApisApiDomainFiltersAfterOptionsComponent;
  }
}
