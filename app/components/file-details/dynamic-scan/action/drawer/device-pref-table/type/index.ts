import Component from '@glimmer/component';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';
import ENUMS from 'irene/enums';

export interface FileDetailsDynamicScanDrawerDevicePrefTableTypeSignature {
  Args: {
    deviceProps: ProjectAvailableDeviceModel;
    selectedDevice: ProjectAvailableDeviceModel;
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
