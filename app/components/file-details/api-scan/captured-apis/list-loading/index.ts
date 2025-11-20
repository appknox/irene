import Component from '@glimmer/component';

export default class FileDetailsApiScanCapturedApisListLoadingComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::ListLoading': typeof FileDetailsApiScanCapturedApisListLoadingComponent;
  }
}
