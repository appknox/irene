import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

import type CapturedApiModel from 'irene/models/capturedapi';

export interface FileDetailsApiScanCapturedApiOverviewSignature {
  Args: {
    capturedApi: CapturedApiModel;
    toggleApi: () => Promise<void>;
  };
}

export default class FileDetailsApiScanCapturedApiOverviewComponent extends Component<FileDetailsApiScanCapturedApiOverviewSignature> {
  handleToggleApi = task(async () => {
    await this.args.toggleApi();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::CapturedApis::Overview': typeof FileDetailsApiScanCapturedApiOverviewComponent;
  }
}
