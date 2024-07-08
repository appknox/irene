import Component from '@glimmer/component';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';
import ENUMS from 'irene/enums';

export interface DynamicScanModalDevicePrefTableTypeSignature {
  Args: {
    deviceProps: ProjectAvailableDeviceModel;
    selectedDevice: ProjectAvailableDeviceModel;
  };
}

export default class DynamicScanModalDevicePrefTableTypeComponent extends Component<DynamicScanModalDevicePrefTableTypeSignature> {
  isPhoneDevice = ENUMS.DEVICE_TYPE.PHONE_REQUIRED;
  isTabletDevice = ENUMS.DEVICE_TYPE.TABLET_REQUIRED;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'dynamic-scan/modal/device-pref-table/type': typeof DynamicScanModalDevicePrefTableTypeComponent;
  }
}
