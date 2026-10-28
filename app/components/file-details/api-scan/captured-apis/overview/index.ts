import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

import apiMethodChipColor from 'irene/utils/api-method-chip-color';
import type CapturedApiModel from 'irene/models/capturedapi';

export interface FileDetailsApiScanCapturedApiOverviewSignature {
  Args: {
    capturedApi: CapturedApiModel;
    toggleApi: () => Promise<void>;
    disableToggleApi: boolean;
  };
}

export default class FileDetailsApiScanCapturedApiOverviewComponent extends Component<FileDetailsApiScanCapturedApiOverviewSignature> {
  get methodChipColor() {
    return apiMethodChipColor(this.args.capturedApi.request?.method);
  }

  get disableToggleApi() {
    return this.args.disableToggleApi || this.handleToggleApi.isRunning;
  }

  handleToggleApi = task(async () => {
    await this.args.toggleApi();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::Overview': typeof FileDetailsApiScanCapturedApiOverviewComponent;
  }
}
