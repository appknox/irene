/* eslint-disable prettier/prettier */
import DRFSerializer from './drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default DRFSerializer.extend(EmbeddedRecordsMixin, {
  attrs: {
    // vulnerability: { embedded: 'always' },
    attachments: { embedded: 'always' },
  },
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: {
        id: payload.id,
        type: 'device-preference',
        attributes: {
          platformVersion: payload.platform_version,
          deviceType: payload.device_type,
        },
      },
    };
  },
});
