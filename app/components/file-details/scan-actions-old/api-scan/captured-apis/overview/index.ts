import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import CapturedApiModel from 'irene/models/capturedapi';

export interface FileDetailsScanActionsOldApiScanCapturedApiOverviewSignature {
  Args: {
    capturedApi: CapturedApiModel;
    toggleApi: () => Promise<void>;
  };
}

export default class FileDetailsScanActionsOldApiScanCapturedApiOverviewComponent extends Component<FileDetailsScanActionsOldApiScanCapturedApiOverviewSignature> {
  handleToggleApi = task(async () => {
    await this.args.toggleApi();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActionsOld::ApiScan::CapturedApis::Overview': typeof FileDetailsScanActionsOldApiScanCapturedApiOverviewComponent;
  }
}
