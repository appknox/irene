import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { runTask } from 'ember-lifeline';
import type Store from '@ember-data/store';

import type ApiScanOptionsModel from 'irene/models/api-scan-options';
import type FileModel from 'irene/models/file';
import styles from './index.scss';

export interface FileDetailsApiScanCapturedApisApiDomainFiltersSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsApiScanCapturedApisApiDomainFiltersComponent extends Component<FileDetailsApiScanCapturedApisApiDomainFiltersSignature> {
  @service declare store: Store;
  @tracked apiScanOptions?: ApiScanOptionsModel;

  @tracked showSelectBox = true;
  @tracked applyFilters = false;
  @tracked clearAll = false;

  @tracked selectedAPIUrlDomain: string[] = [
    'example.domain.com',
    'subdomain.domain.com',
  ];

  constructor(
    owner: unknown,
    args: FileDetailsApiScanCapturedApisApiDomainFiltersSignature['Args']
  ) {
    super(owner, args);
    this.fetchApiScanOptions.perform();
  }

  get extra() {
    return {
      beforeOptionLabel: 'Select the Domain',
      iconName: 'filter-list',
      onClearAll: this.onClearAll,
      selectedItem: this.selectedAPIUrlDomain,
      onApplyFilters: this.onApplyFilters,
    };
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-trigger'];
  }

  get apiDomainFilters() {
    return this.apiScanOptions?.dsApiCaptureFilters || [];
  }

  @action
  onClearAll() {
    this.selectedAPIUrlDomain = [];
  }

  @action
  onSelectAPIUrlDomainChange(value: string) {
    const currentSelectedAPIUrlDomain = [...this.selectedAPIUrlDomain];

    if (this.isDomainFilterSelected(value)) {
      this.selectedAPIUrlDomain = currentSelectedAPIUrlDomain.filter(
        (domain) => domain !== value
      );
    } else {
      this.selectedAPIUrlDomain = [...currentSelectedAPIUrlDomain, value];
    }
  }

  @action
  isDomainFilterSelected(value: string) {
    return (
      this.selectedAPIUrlDomain.findIndex((domain) => domain === value) !== -1
    );
  }

  @action
  onApplyFilters() {
    // debugger;
    console.log(this.selectedAPIUrlDomain);
    this.showSelectBox = false;

    // Reload the select box
    runTask(this, () => {
      this.showSelectBox = true;
    });
  }

  fetchApiScanOptions = task(async () => {
    const fileProject = await this.args.file.get('project');
    const profileId = fileProject.get('activeProfileId');

    this.apiScanOptions = await this.store.queryRecord('api-scan-options', {
      id: profileId,
    });
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::ApiDomainFilters': typeof FileDetailsApiScanCapturedApisApiDomainFiltersComponent;
  }
}
