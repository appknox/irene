import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.results.map((item) => {
        return {
          id: item.id,
          type: 'trackers',
          attributes: item,
        };
      }),
      meta: { count: payload.count },
    };
  },
});
