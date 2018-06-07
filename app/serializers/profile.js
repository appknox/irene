import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: {
        id: payload.id,
        type: 'profile',
        attributes: {
          showUnknownAnalysis: payload.show_unknown_analysis
        }
      }
    };
  }
});
