import Component from '@glimmer/component';

import ENUMS from 'irene/enums';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';

export interface FileDetailsDynamicScanDrawerDevicePrefTableTypeSignature {
  Args: {
    deviceProps: AvailableManualDeviceModel;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableTypeComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableTypeSignature> {
  isPhoneDevice = ENUMS.DS_DEVICE_TYPE.PHONE_REQUIRED;
  isTabletDevice = ENUMS.DS_DEVICE_TYPE.TABLET_REQUIRED;

  // Anything not registered by the farm itself is a customer-owned (CYOD)
  // device — enrolled either through the Mercer proxy or WebUSB. Both behave
  // the same from the scan-picker's point of view, so they share one badge.
  get isCyodDevice() {
    return (
      this.args.deviceProps?.registrationSource !==
      ENUMS.DEVICE_REGISTRATION_SOURCE.FARM
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/type': typeof FileDetailsDynamicScanDrawerDevicePrefTableTypeComponent;
  }
}
