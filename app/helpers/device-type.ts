import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function deviceType(params: [string | number]) {
  const currentDevice = params[0];

  switch (currentDevice) {
    case ENUMS.DS_AUTOMATED_DEVICE_TYPE.NO_PREFERENCE:
      return 'anyDevice';

    case ENUMS.DS_AUTOMATED_DEVICE_TYPE.PHONE_REQUIRED:
      return 'phone';

    case ENUMS.DS_AUTOMATED_DEVICE_TYPE.TABLET_REQUIRED:
      return 'tablet';

    default:
      return 'anyDevice';
  }
}

const DeviceTypeHelper = helper(deviceType);

export default DeviceTypeHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'device-type': typeof DeviceTypeHelper;
  }
}
