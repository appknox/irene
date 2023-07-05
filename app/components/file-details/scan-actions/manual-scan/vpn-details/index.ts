import { action } from '@ember/object';
import Component from '@glimmer/component';
import FileModel from 'irene/models/file';
import ManualscanModel from 'irene/models/manualscan';

export interface FileDetailsScanActionsManualScanVpnDetailsSignature {
  Args: {
    file: FileModel;
    manualscan: ManualscanModel | null;
  };
}

export default class FileDetailsScanActionsManualScanVpnDetailsComponent extends Component<FileDetailsScanActionsManualScanVpnDetailsSignature> {
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
    'FileDetails::ScanActions::ManualScan::VpnDetails': typeof FileDetailsScanActionsManualScanVpnDetailsComponent;
    'file-details/scan-actions/manual-scan/vpn-details': typeof FileDetailsScanActionsManualScanVpnDetailsComponent;
  }
}
