import Ember from 'ember';
import ENUMS from 'irene/enums';

// This function receives the params `params, hash`
const deviceType = function(params) {

  const currentDevice = params[0];

  if (currentDevice === ENUMS.DEVICE_TYPE.NO_PREFERENCE) {
    return "anyDevice";
  } else if (currentDevice === ENUMS.DEVICE_TYPE.PHONE_REQUIRED) {
    return "phone";
  } else if (currentDevice === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
    return "tablet";
  } else {
    return "anyDevice";
  }
};

const DeviceTypeHelper = Ember.Helper.helper(deviceType);

export { deviceType };

export default DeviceTypeHelper;
