import Component from '@glimmer/component';
import { action } from '@ember/object';
import type { FileDetailsApiScanCapturedApisApiDomainFiltersExtra } from '../index';

interface FileDetailsApiScanCapturedApisApiDomainFiltersGroupOptionArgs {
  Args: {
    extra?: FileDetailsApiScanCapturedApisApiDomainFiltersExtra;
    group: {
      id: string;
      groupName: string;
      options: string[];
    };
  };
}

export default class FileDetailsApiScanCapturedApisApiDomainFiltersGroupOptionComponent extends Component<FileDetailsApiScanCapturedApisApiDomainFiltersGroupOptionArgs> {
  get beforeOptionLabel() {
    return this.args.extra?.beforeOptionLabel;
  }

  get fileProjectId() {
    return this.args.extra?.file.project.get('id');
  }

  get isProjectProfileFilters() {
    return this.args.group.id === 'project-profile-filters';
  }

  @action
  isDomainFilterSelected(option: string) {
    return this.args.extra?.isDomainFilterSelected(option);
  }

  @action
  onSelectAPIUrlDomainChange(option: string) {
    this.args.extra?.onSelectAPIUrlDomainChange(option);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/api-scan/captured-apis/api-domain-filters/group-option': typeof FileDetailsApiScanCapturedApisApiDomainFiltersGroupOptionComponent;
  }
}
