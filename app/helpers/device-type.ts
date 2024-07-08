import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function deviceType(params: [string | number]) {
  const currentDevice = params[0];

  switch (currentDevice) {
    case ENUMS.DEVICE_TYPE.PHONE_REQUIRED:
      return 'phone';

    case ENUMS.DEVICE_TYPE.TABLET_REQUIRED:
      return 'tablet';

    default:
      return 'phone';
  }
}

const DeviceTypeHelper = helper(deviceType);

export default DeviceTypeHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'device-type': typeof DeviceTypeHelper;
  }
}
