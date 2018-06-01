import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: {
        id: 1,
        type: 'unknown-analysis-status',
        attributes: {
          status: payload.status
        }
      }
    };
  }
});
