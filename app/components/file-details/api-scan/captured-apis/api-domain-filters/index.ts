import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type { Select } from 'ember-power-select/components/power-select';
import type FileModel from 'irene/models/file';

import styles from './index.scss';

export interface FileDetailsApiScanCapturedApisApiDomainFiltersSignature {
  Args: {
    file: FileModel;
    domainFilters: string[];
    selectedAPIUrlDomain: string[];
    onDomainFilterChange: (domainFilters: string[]) => void;
    onDomainFilterApply: () => void;
  };
}

export default class FileDetailsApiScanCapturedApisApiDomainFiltersComponent extends Component<FileDetailsApiScanCapturedApisApiDomainFiltersSignature> {
  @tracked closeDrawer = false;
  @tracked selectInstance: Select | null = null;

  get selectElementExtras() {
    return {
      beforeOptionLabel: 'Select the Domain',
      iconName: 'filter-list',
      onClearAll: this.onClearAll,
      selectedItem: this.args.selectedAPIUrlDomain,
      onApplyFilters: this.onApplyFilters,
    };
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-trigger'];
  }

  @action
  onClearAll() {
    this.args.onDomainFilterChange([]);
    this.args.onDomainFilterApply();
  }

  @action
  onSelectAPIUrlDomainChange(value: string) {
    const currentSelectedAPIUrlDomain = [...this.args.selectedAPIUrlDomain];

    if (this.isDomainFilterSelected(value)) {
      this.args.onDomainFilterChange(
        currentSelectedAPIUrlDomain.filter((domain) => domain !== value)
      );
    } else {
      this.args.onDomainFilterChange([...currentSelectedAPIUrlDomain, value]);
    }
  }

  @action
  isDomainFilterSelected(value: string) {
    return (
      this.args.selectedAPIUrlDomain.findIndex((domain) => domain === value) !==
      -1
    );
  }

  @action
  registerAPI(instance: Select) {
    this.selectInstance = instance;
  }

  @action
  onOpen(_select: Select, event: Event) {
    const target = event.target as HTMLDivElement;

    // Do not open the dropdown if the clear all button is clicked
    return target.id !== 'clear-all-domain-filter-button';
  }

  @action
  onApplyFilters() {
    this.args.onDomainFilterApply();
    this.selectInstance?.actions.close();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::ApiDomainFilters': typeof FileDetailsApiScanCapturedApisApiDomainFiltersComponent;
  }
}
