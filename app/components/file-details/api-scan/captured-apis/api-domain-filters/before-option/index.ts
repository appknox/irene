import Component from '@glimmer/component';

interface FileDetailsApiScanCapturedApisApiDomainFiltersBeforeOptionArgs {
  extra?: Record<'beforeOptionLabel', string>;
}

export default class FileDetailsApiScanCapturedApisApiDomainFiltersBeforeOptionComponent extends Component<FileDetailsApiScanCapturedApisApiDomainFiltersBeforeOptionArgs> {
  get beforeOptionLabel() {
    return this.args.extra?.['beforeOptionLabel'];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/api-scan/captured-apis/api-domain-filters/before-option': typeof FileDetailsApiScanCapturedApisApiDomainFiltersBeforeOptionComponent;
  }
}
