import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function dsManualDevicePref(params: [number | string]) {
  const devicePrefernce = params[0];

  switch (devicePrefernce) {
    case ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE:
      return 'anyDevice';

    case ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE:
      return 'specificDevice';

    default:
      return 'anyDevice';
  }
}

const DsManualDevicePrefHelper = helper(dsManualDevicePref);

export default DsManualDevicePrefHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ds-manual-device-pref': typeof DsManualDevicePrefHelper;
  }
}
