import { action } from '@ember/object';
import Component from '@glimmer/component';
import FileModel from 'irene/models/file';
import ManualscanModel from 'irene/models/manualscan';

export interface FileDetailsScanActionsOldManualScanVpnDetailsSignature {
  Args: {
    file: FileModel;
    manualscan: ManualscanModel | null;
  };
}

export default class FileDetailsScanActionsOldManualScanVpnDetailsComponent extends Component<FileDetailsScanActionsOldManualScanVpnDetailsSignature> {
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
    'FileDetails::ScanActionsOld::ManualScan::VpnDetails': typeof FileDetailsScanActionsOldManualScanVpnDetailsComponent;
    'file-details/scan-actions-old/manual-scan/vpn-details': typeof FileDetailsScanActionsOldManualScanVpnDetailsComponent;
  }
}
