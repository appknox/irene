import { helper } from '@ember/component/helper';
import ENUMS from 'irene/enums';

export function dsAutomatedDevicePref(params: [number | string]) {
  const devicePreference = params[0];

  switch (devicePreference) {
    case ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE:
      return 'anyDevice';

    case ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA:
      return 'defineDeviceCriteria';

    default:
      return 'anyDevice';
  }
}

const DsAutomatedDevicePrefHelper = helper(dsAutomatedDevicePref);

export default DsAutomatedDevicePrefHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ds-automated-device-pref': typeof DsAutomatedDevicePrefHelper;
  }
}
