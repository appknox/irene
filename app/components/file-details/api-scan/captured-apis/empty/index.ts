import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

export interface FileDetailsApiScanCapturedApisEmptySignature {}

export default class FileDetailsApiScanCapturedApisEmptyComponent extends Component<FileDetailsApiScanCapturedApisEmptySignature> {
  @service declare intl: IntlService;

  get apiCaptureSteps() {
    return [
      this.intl.t('capturedApiEmptySteps.0'),
      this.intl.t('capturedApiEmptySteps.1'),
      this.intl.t('capturedApiEmptySteps.2'),
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::Empty': typeof FileDetailsApiScanCapturedApisEmptyComponent;
  }
}
