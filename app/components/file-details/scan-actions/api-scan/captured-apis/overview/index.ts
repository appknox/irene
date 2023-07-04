import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import CapturedApiModel from 'irene/models/capturedapi';

export interface FileDetailsScanActionsApiScanCapturedApiOverviewSignature {
  Args: {
    capturedApi: CapturedApiModel;
    toggleApi: () => Promise<void>;
  };
}

export default class FileDetailsScanActionsApiScanCapturedApiOverviewComponent extends Component<FileDetailsScanActionsApiScanCapturedApiOverviewSignature> {
  handleToggleApi = task(async () => {
    await this.args.toggleApi();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions::ApiScan::CapturedApis::Overview': typeof FileDetailsScanActionsApiScanCapturedApiOverviewComponent;
  }
}
