import Component from '@glimmer/component';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';

export interface FileDetailsDynamicScanDrawerDevicePrefTableDeviceIdSignature {
  Args: {
    deviceProps: AvailableManualDeviceModel;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableDeviceIdComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableDeviceIdSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/device-id': typeof FileDetailsDynamicScanDrawerDevicePrefTableDeviceIdComponent;
  }
}
