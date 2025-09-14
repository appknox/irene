import Component from '@glimmer/component';
import { action } from '@ember/object';
import type { AkIconVariantType } from 'ak-icons';
import type { FileDetailsApiScanCapturedApisApiDomainFiltersExtra } from '..';

interface FileDetailsApiScanCapturedApisApiDomainFiltersFilterSelectedItemArgs {
  Args: {
    extra?: FileDetailsApiScanCapturedApisApiDomainFiltersExtra;
  };
}

export default class FileDetailsApiScanCapturedApisApiDomainFiltersFilterSelectedItemComponent extends Component<FileDetailsApiScanCapturedApisApiDomainFiltersFilterSelectedItemArgs> {
  get optionTitle() {
    return this.args.extra?.optionTitle;
  }

  get selectedItem() {
    return this.args.extra?.selectedItem;
  }

  get hasSelectedItems() {
    return this.selectedItem?.length && this.selectedItem.length > 0;
  }

  get iconName() {
    return this.args.extra?.iconName as AkIconVariantType;
  }

  @action
  handleClearAll() {
    this.args.extra?.onClearAll();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/api-scan/captured-apis/api-domain-filters/filter-selected-item': typeof FileDetailsApiScanCapturedApisApiDomainFiltersFilterSelectedItemComponent;
  }
}
