import Component from '@glimmer/component';

import ENUMS from 'irene/enums';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';

export interface FileDetailsDynamicScanDrawerDevicePrefTableTypeSignature {
  Args: {
    deviceProps: AvailableManualDeviceModel;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableTypeComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableTypeSignature> {
  isPhoneDevice = ENUMS.DEVICE_TYPE.PHONE_REQUIRED;
  isTabletDevice = ENUMS.DEVICE_TYPE.TABLET_REQUIRED;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/type': typeof FileDetailsDynamicScanDrawerDevicePrefTableTypeComponent;
  }
}
