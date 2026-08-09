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
  get deviceTypeLabel() {
    return deviceType([
      this.args.deviceProps?.isTablet
        ? ENUMS.DS_DEVICE_TYPE.TABLET_REQUIRED
        : ENUMS.DS_DEVICE_TYPE.PHONE_REQUIRED,
    ]);
  }

  // Matched positively rather than as "not FARM": registration_source is absent
  // from older device payloads, and undefined !== FARM would badge every one of
  // them as CYOD.
  get isCyodDevice() {
    const source = this.args.deviceProps?.registrationSource;

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
