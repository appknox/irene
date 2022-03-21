/* eslint-disable prettier/prettier */
import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: {
        id: payload.id,
        type: 'api-scan-options',
        attributes: {
          apiUrlFilters: payload.api_url_filters
        }
      }
    };
  }
});
