import Component from '@glimmer/component';
import type { Task } from 'ember-concurrency';
import type FileModel from 'irene/models/file';

export interface FileDetailsApiScanCapturedApiHeaderSignature {
  Args: {
    file: FileModel;
    allAPIsSelected: boolean;
    selectAllCapturedApis: Task<unknown, [boolean]>;
    domainFilters: string[];
    selectedAPIUrlDomain: string[];
    handleSelectAllCapturedApis: (event: Event, checked: boolean) => void;
    handleDomainFilterChange: (domainFilters: string[]) => void;
    onDomainFilterApply: () => void;
  };
}

export default class FileDetailsApiScanCapturedApiHeaderComponent extends Component<FileDetailsApiScanCapturedApiHeaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::Header': typeof FileDetailsApiScanCapturedApiHeaderComponent;
  }
}
