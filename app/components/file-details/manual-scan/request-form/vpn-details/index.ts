import { action } from '@ember/object';
import Component from '@glimmer/component';

import type FileModel from 'irene/models/file';
import type ManualscanModel from 'irene/models/manualscan';

export interface FileDetailsManualScanRequestFormVpnDetailsSignature {
  Args: {
    file: FileModel;
    manualscan: ManualscanModel | null;
  };
}

export default class FileDetailsManualScanRequestFormVpnDetailsComponent extends Component<FileDetailsManualScanRequestFormVpnDetailsSignature> {
  get vpnStatuses() {
    return ['yes', 'no'];
  }

  @action
  handleVpnStatusChange(status: string) {
    this.args.manualscan?.set('vpnRequired', status === 'yes');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ManualScan::RequestForm::VpnDetails': typeof FileDetailsManualScanRequestFormVpnDetailsComponent;
    'file-details/manual-scan/request-form/vpn-details': typeof FileDetailsManualScanRequestFormVpnDetailsComponent;
  }
}
