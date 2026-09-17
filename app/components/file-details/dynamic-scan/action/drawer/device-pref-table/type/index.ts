import Component from '@glimmer/component';

import ENUMS from 'irene/enums';
import { deviceType } from 'irene/helpers/device-type';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';

export interface FileDetailsDynamicScanDrawerDevicePrefTableTypeSignature {
  Args: {
    deviceProps: AvailableManualDeviceModel;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableTypeComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableTypeSignature> {
  get deviceProps() {
    return this.args.deviceProps;
  }

  get deviceTypeLabel() {
    return deviceType([
      this.deviceProps?.isTablet
        ? ENUMS.DS_DEVICE_TYPE.TABLET_REQUIRED
        : ENUMS.DS_DEVICE_TYPE.PHONE_REQUIRED,
    ]);
  }

  get isCyodDevice() {
    const source = this.deviceProps?.registrationSource;

    return (
      source === ENUMS.DEVICE_REGISTRATION_SOURCE.PROXY ||
      source === ENUMS.DEVICE_REGISTRATION_SOURCE.WEBUSB
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/type': typeof FileDetailsDynamicScanDrawerDevicePrefTableTypeComponent;
  }
}
