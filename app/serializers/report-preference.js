import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: {
        id: payload.id,
        type: 'report-preference',
        attributes: {
          showIgnoredAnalyses: payload.show_ignored_analyses
        }
      }
    };
  }
});
