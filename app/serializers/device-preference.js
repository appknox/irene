/* eslint-disable prettier/prettier */
import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: {
        id: payload.id,
        type: 'device-preference',
        attributes: {
          platformVersion: payload.platform_version,
          deviceType: payload.device_type
        }
      }
    };
  }
});
