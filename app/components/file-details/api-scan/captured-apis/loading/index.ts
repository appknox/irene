import Component from '@glimmer/component';

export default class FileDetailsApiScanCapturedApisLoadingComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::Loading': typeof FileDetailsApiScanCapturedApisLoadingComponent;
  }
}
